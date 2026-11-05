import fetch from "cross-fetch";

export interface HttpClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestOptions {
  /** Aborts the request, including reading the response body. */
  signal?: AbortSignal;
}

const createHttpClient = () => {
  const request = async <T, U = unknown>(
    baseUrl: string,
    path: string,
    method: HttpMethod,
    body?: U,
    options?: RequestOptions,
  ) => {
    const url = new URL(path, baseUrl).toString();

    const contentType = body
      ? { "content-type": "application/json" }
      : undefined;

    return fetch(url, {
      body: body ? JSON.stringify(body) : undefined,
      method,
      signal: options?.signal,
      headers: {
        accept: "application/json",
        ...contentType,
      },
    }).then((response) => {
      if (!response.ok) {
        console.error({ description: "HTTP error", response });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json() as T;
    });
  };

  const get = async <T = unknown>(
    baseUrl: string,
    path: string,
  ): Promise<T> => {
    return request(baseUrl, path, "GET");
  };

  const post = async <T = unknown, U = unknown>(
    baseUrl: string,
    path: string,
    body: U,
    options?: RequestOptions,
  ): Promise<T> => {
    return request(baseUrl, path, "POST", body, options);
  };

  const put = async <T = unknown, U = unknown>(
    baseUrl: string,
    path: string,
    body: T,
  ): Promise<U> => {
    return request(baseUrl, path, "PUT", body);
  };

  const del = async <T = unknown>(
    baseUrl: string,
    path: string,
  ): Promise<T> => {
    return request(baseUrl, path, "DELETE");
  };

  return { get, post, put, delete: del };
};

export const httpClient = createHttpClient();
