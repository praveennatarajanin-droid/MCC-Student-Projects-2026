const API_BASE_URL = "http://localhost:5019/api";

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  // Attach token from localStorage or options
  const token = options.token || (typeof window !== "undefined" ? localStorage.getItem("mcc_token") : null);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set Content-Type default to json unless it's FormData
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = "An error occurred.";
    try {
      const errorJson = JSON.parse(text);
      if (typeof errorJson === "string") {
        errorMessage = errorJson;
      } else if (errorJson.message) {
        errorMessage = errorJson.message;
      } else if (errorJson.errors) {
        errorMessage = Object.entries(errorJson.errors)
          .map(([field, msgs]: any) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
      } else if (errorJson.title) {
        errorMessage = errorJson.title;
      }
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export const api = {
  get: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: "GET", token }),

  post: <T>(endpoint: string, body: any, token?: string | null) =>
    request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      token,
    }),

  put: <T>(endpoint: string, body: any, token?: string | null) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
      token,
    }),

  delete: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: "DELETE", token }),

  upload: async (file: File, folder: string = "general", token?: string | null): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const result = await request<{ url: string }>("/upload", {
      method: "POST",
      body: formData,
      token,
    });
    return result.url;
  },
};
