import fetch from "isomorphic-unfetch";

export interface HttpClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const createHttpClient = () => {
  const request = async <T, U>(
    baseUrl: string,
    path: string,
    method: HttpMethod,
    body?: U,
  ) => {
    const url = new URL(path, baseUrl).toString();

    const contentType = body
      ? { "content-type": "application/json" }
      : undefined;

    return fetch(url, {
      body: body ? JSON.stringify(body) : undefined,
      method,
      headers: {
        accept: "application/json",
        ...contentType,
      },
    }).then((response) => {
      if (!response.ok) {
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
  ): Promise<T> => {
    return request(baseUrl, path, "POST", body);
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
