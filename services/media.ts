import { fetchClient, API_BASE_URL } from './core';
import { toast } from '../components/Toast';

// 1. 定义配置接口 (这样编辑器会有代码提示)
export interface CompressOptions {
  maxWidth?: number; // 默认 1600
  quality?: number; // 默认 0.7 (0~1)
  type?: 'image/jpeg' | 'image/png' | 'image/webp'; // 默认 image/webp
}

// Helper: Convert File to Base64 Data URI (Raw)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Helper: Client-side Image Compression
 */
export const compressImage = (file: File, options: CompressOptions = {}): Promise<string> => {
  const { maxWidth = 1600, quality = 0.7, type = 'image/webp' } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(type, quality));
        } else {
          resolve(event.target?.result as string);
        }
      };

      img.onerror = (e) => reject(new Error('Image load failed'));
    };

    reader.onerror = (e) => reject(new Error('File read failed'));
  });
};

// Helper to upload to Cloudflare R2
const uploadToR2 = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('files', file); // Field name MUST be 'files'

  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {};
  if (token) headers['x-auth-token'] = token;

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`R2 Upload Failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  if (data.success && data.urls && data.urls.length > 0) {
    return data.urls[0];
  }
  throw new Error('R2 Upload returned no URLs');
};

// Helper to upload to Cloudinary directly
const uploadToCloudinary = async (file: File): Promise<string> => {
  const config = await fetchClient<{ cloudName: string; apiKey: string }>('/cloudinary/config');
  const signData = await fetchClient<{ timestamp: number; signature: string }>(
    '/cloudinary/signature'
  );

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', config.apiKey);
  formData.append('timestamp', signData.timestamp.toString());
  formData.append('signature', signData.signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    throw new Error(`Cloudinary Upload Failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.secure_url;
};

interface UploadOptions {
  forceCloudinary?: boolean;
}

// NEW: Helper to upload image (Public for components)
// Strategy: Try R2 first -> Fail -> Try Cloudinary -> Fail -> Return Base64 (Local)
export const uploadImage = async (file: File, options?: UploadOptions): Promise<string> => {
  // 1. Force Cloudinary (e.g. for Avatar face detection features)
  if (options?.forceCloudinary) {
    try {
      return await uploadToCloudinary(file);
    } catch (e) {
      console.error('Forced Cloudinary upload failed:', e);
      toast.error('Avatar upload failed. Trying local compression.');
      return await compressImage(file);
    }
  }

  // 2. Default: Try R2 First
  try {
    return await uploadToR2(file);
  } catch (r2Error) {
    console.warn('R2 upload failed, falling back to Cloudinary:', r2Error);

    // 3. Fallback: Cloudinary
    try {
      const cloudinaryUrl = await uploadToCloudinary(file);
      // Optional: Toast to inform user of fallback? Maybe too noisy.
      return cloudinaryUrl;
    } catch (cloudinaryError) {
      console.error('Cloudinary fallback failed:', cloudinaryError);

      // 4. Fallback: Local Base64
      try {
        const compressed = await compressImage(file);
        toast.info('Uploads failed. Using local compression.');
        return compressed;
      } catch (compressError) {
        return await fileToBase64(file);
      }
    }
  }
};
