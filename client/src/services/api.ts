const API_BASE_URL = typeof window !== 'undefined'
  ? '/api'
  : (process.env.BACKEND_URL ? `${process.env.BACKEND_URL.replace(/\/api\/?$/, '')}/api` : 'http://localhost:8080/api');

export async function fetchApi<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const url = `${cleanBase}${cleanEndpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type');
  let data: any;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Lỗi máy chủ (${response.status}): ${text.slice(0, 150)}`);
    }
    return text as unknown as T;
  }

  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra khi gọi API');
  }

  return data;
}
