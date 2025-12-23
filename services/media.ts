import { fetchClient } from './core';
import { toast } from '../components/Toast';

// 1. 定义配置接口 (这样编辑器会有代码提示)
export interface CompressOptions {
  maxWidth?: number; // 默认 1600
  quality?: number; // 默认 0.7 (0~1)
  type?: 'image/jpeg' | 'image/png' | 'image/webp'; // 默认 image/webp
}

// Helper: Convert File to Base64 Data URI (Raw)
// 这个保持不变，用于不需要压缩的场景
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
 * 修复点：参数改为对象解构，完美适配 ZenEditor 的调用方式
 */
export const compressImage = (file: File, options: CompressOptions = {}): Promise<string> => {
  // 设置默认值：使用 WebP 格式通常比 JPEG 小 30%
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

        // 智能缩放逻辑
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 平滑绘制
          ctx.drawImage(img, 0, 0, width, height);

          // 导出压缩后的 Base64 (使用配置的 type 和 quality)
          resolve(canvas.toDataURL(type, quality));
        } else {
          // 降级处理：如果 Canvas 挂了，返回原图 Base64
          resolve(event.target?.result as string);
        }
      };

      img.onerror = (e) => reject(new Error('Image load failed'));
    };

    reader.onerror = (e) => reject(new Error('File read failed'));
  });
};

// Helper to upload to Cloudinary directly
const uploadToCloudinary = async (file: File): Promise<string> => {
  // 1. Get Public Config
  const config = await fetchClient<{ cloudName: string; apiKey: string }>('/cloudinary/config');

  // 2. Get Secure Signature
  const signData = await fetchClient<{ timestamp: number; signature: string }>(
    '/cloudinary/signature'
  );

  // 3. Construct FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', config.apiKey);
  formData.append('timestamp', signData.timestamp.toString());
  formData.append('signature', signData.signature);

  // 4. Post to Cloudinary (Use native fetch to avoid adding app auth headers)
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

// NEW: Helper to upload image (Public for components)
export const uploadImage = async (file: File): Promise<string> => {
  try {
    return await uploadToCloudinary(file);
  } catch (e) {
    console.warn('Cloudinary upload failed, falling back to compression:', e);
    try {
      const compressed = await compressImage(file);
      toast.info('Using local compression fallback.');
      return compressed;
    } catch (compressError) {
      return await fileToBase64(file);
    }
  }
};
