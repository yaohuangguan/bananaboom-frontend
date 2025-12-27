import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob } from '@google/genai';
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

// Initialize GenAI inside the component to ensure latest API Key is used if it changes,
// though here it's exported from geminiService for simplicity.
import { ai } from '../services/geminiService';

// --- Audio Encoding / Decoding Helpers ---
/* Corrected to return @google/genai Blob object format */
function createBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    // The supported audio MIME type is 'audio/pcm'.
    mimeType: 'audio/pcm;rate=16000'
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = (reader.result as string).split(',')[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const LiveAgent: React.FC = () => {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [status, setStatus] = useState<string>('Ready');
  const [userTranscript, setUserTranscript] = useState('');
  const [modelTranscript, setModelTranscript] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Audio & Session Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const frameIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleDisconnect();
    };
  }, []);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => (track.enabled = isMicOn));
    }
  }, [isMicOn]);

  const handleConnect = async () => {
    try {
      setStatus('Connecting...');

      // 1. Setup Audio Contexts
      inputAudioContextRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 16000 });
      outputAudioContextRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 24000 });

      const inputNode = inputAudioContextRef.current.createGain();
      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      // 2. Get User Media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // 3. Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction:
            'You are a helpful, witty, and concise AI assistant named Sam. You are interacting via a video call.'
        },
        callbacks: {
          onopen: () => {
            setStatus('Connected');
            setIsConnected(true);

            // Audio Input Processing
            if (!inputAudioContextRef.current) return;
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

            /* Corrected onaudioprocess to remove isConnected check and use createBlob helper */
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`, **do not** add other condition checks.
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcription
            if (message.serverContent?.inputTranscription) {
              setUserTranscript((prev) => message.serverContent?.inputTranscription?.text || prev);
            }
            if (message.serverContent?.outputTranscription) {
              setModelTranscript(
                (prev) => message.serverContent?.outputTranscription?.text || prev
              );
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              /* Ensure smooth, gapless playback by scheduling next start time */
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);

              source.onended = () => sourcesRef.current.delete(source);
            }

            // Handle Interruptions
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach((s) => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setStatus('Disconnected');
            setIsConnected(false);
          },
          onerror: (e: any) => {
            console.error('Live API Error:', e);
            setStatus('Error');
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

      // 4. Start Video Frame Loop
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx && videoRef.current) {
        frameIntervalRef.current = window.setInterval(() => {
          if (!isCamOn) return;

          canvas.width = videoRef.current!.videoWidth;
          canvas.height = videoRef.current!.videoHeight;
          ctx.drawImage(videoRef.current!, 0, 0);

          canvas.toBlob(
            async (blob) => {
              if (blob) {
                const base64Data = await blobToBase64(blob);
                /* Ensure data is streamed only after the session promise resolves */
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({
                    media: { data: base64Data, mimeType: 'image/jpeg' }
                  });
                });
              }
            },
            'image/jpeg',
            0.5
          );
        }, 1000); // 1 FPS for efficiency in this demo
      }
    } catch (e) {
      console.error(e);
      setStatus('Failed to connect');
    }
  };

  const handleDisconnect = () => {
    // Stop Media Stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Stop Audio Contexts
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();

    // Clear Intervals
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);

    setIsConnected(false);
    setStatus('Ready');
    setUserTranscript('');
    setModelTranscript('');
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="container max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-display font-bold text-white mb-2">{t.live.title}</h2>
          <p className="text-slate-400">{t.live.subtitle}</p>
        </div>

        {/* Video Stage */}
        <div className="relative w-full aspect-video max-w-4xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          {/* Main Video Feed */}
          <video
            ref={videoRef}
            muted
            playsInline
            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${isConnected && isCamOn ? 'opacity-100' : 'opacity-20'}`}
          />

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay Status */}
          <div className="absolute top-6 left-6 flex items-center gap-3">
            <span className={`flex h-3 w-3 relative`}>
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              ></span>
            </span>
            <span className="text-sm font-mono text-white/80 uppercase tracking-widest">
              {status}
            </span>
          </div>

          {/* Transcript Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-950/90 to-transparent min-h-[160px] flex flex-col justify-end">
            <div className="space-y-4 max-w-3xl mx-auto w-full">
              {userTranscript && (
                <div className="flex justify-end">
                  <span className="bg-slate-800/80 backdrop-blur-md text-slate-200 px-4 py-2 rounded-2xl rounded-tr-none text-sm border border-slate-700/50">
                    {userTranscript}
                  </span>
                </div>
              )}
              {modelTranscript && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-violet-500 flex items-center justify-center text-xs text-white shadow-lg">
                      <i className="fas fa-robot"></i>
                    </div>
                    <span className="bg-primary-900/40 backdrop-blur-md text-primary-100 px-4 py-2 rounded-2xl rounded-tl-none text-sm border border-primary-500/20">
                      {modelTranscript}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Empty State / Prompt */}
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handleConnect}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-primary-600 font-display rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 hover:bg-primary-700 hover:scale-105"
              >
                <i className="fas fa-video mr-3"></i> {t.live.connect}
                <div className="absolute -inset-3 rounded-full bg-primary-400/20 group-hover:bg-primary-400/30 animate-pulse"></div>
              </button>
            </div>
          )}
        </div>

        {/* Control Bar */}
        {isConnected && (
          <div className="mt-8 flex items-center gap-6 p-4 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 animate-slide-up">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${isMicOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-500 hover:bg-red-600'}`}
            >
              <i className={`fas ${isMicOn ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
            </button>
            <button
              onClick={() => setIsCamOn(!isCamOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${isCamOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-500 hover:bg-red-600'}`}
            >
              <i className={`fas ${isCamOn ? 'fa-video' : 'fa-video-slash'}`}></i>
            </button>
            <button
              onClick={handleDisconnect}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-900/50"
            >
              <i className="fas fa-phone-slash"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
