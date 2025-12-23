import { toast } from '../components/Toast';

export const API_BASE_URL = 'https://bananaboom-api-242273127238.asia-east1.run.app/api';

/**
 * Native fetch wrapper with error handling, timeouts, and auth headers
 */
export async function fetchClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  // Increased timeout to 15s to handle potential Cloud Run cold starts
  const id = setTimeout(() => controller.abort(), 15000);

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Inject token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      (headers as any)['x-auth-token'] = token;
    }

    // Inject Google Auth if available
    const googleInfo = localStorage.getItem('googleInfo');
    if (googleInfo) {
      (headers as any)['x-google-auth'] = googleInfo;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers
    });
    clearTimeout(id);

    // ============================================================
    // 错误处理核心逻辑 (Refactored)
    // ============================================================

    // 如果响应不成功 (status < 200 || status >= 300)
    if (!response.ok) {
      // 1. 第一步：先尝试获取后端返回的真实错误信息
      const errorBody = await response.text();
      let errorMessage = `API Error ${response.status}`; // 默认兜底信息

      try {
        const errorJson = JSON.parse(errorBody);
        // 后端可能用 msg, message, 或者 error 字段
        errorMessage = errorJson.msg || errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        // 如果不是 JSON，尝试直接使用文本内容
        if (errorBody) errorMessage = errorBody;
      }

      // 2. 第二步：根据状态码做特殊处理

      // Handle 401 Unauthorized (Token 过期或无效)
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('googleInfo');
        window.dispatchEvent(new Event('auth:logout'));

        // 使用后端返回的信息，如果后端没返回具体的，再用默认文案
        const displayMsg =
          errorMessage !== `API Error 401` ? errorMessage : 'Session expired. Please login again.';

        toast.error(displayMsg);
        throw new Error(displayMsg);
      }

      // Handle 403 Forbidden (权限不足，如非 VIP)
      if (response.status === 403) {
        toast.error(errorMessage); // 显示 "VIP Access Required" 等
        throw new Error(errorMessage);
      }

      // Handle 400 (Bad Request - 如密码错误) & 500 (Server Error)
      // 直接显示后端给的错误信息，比如 "Invalid Credentials"
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    // ============================================================
    // 成功响应处理
    // ============================================================

    // Handle 204 No Content (often used for DELETE)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(id);

    // Identify abort errors specifically (Timeout)
    if (error.name === 'AbortError') {
      const msg = 'Request timed out. The server might be waking up.';
      toast.error(msg);
      throw new Error(msg);
    }

    // Handle Network Errors (DNS, Offline, etc - things that don't return a response)
    // 注意：fetch 只有在网络故障时才会进入 catch，4xx/5xx 不会进这里
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      const msg = 'Network connection error. Please check your internet.';
      toast.error(msg);
      throw new Error(msg);
    }

    // Re-throw handled errors (from the !response.ok block) or other unknown errors
    throw error;
  }
}
