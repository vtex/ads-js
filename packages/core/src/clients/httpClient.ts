import fetch from "isomorphic-unfetch";

const request = async <T>(
  url: string,
  method: string,
  body?: any,
  headers: Record<string, string> = {},
): Promise<T> => {
  return fetch(url, {
    method,
    headers: {
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  });
};

export const get = async <T>(url: string): Promise<T> => {
  return request<T>(url, "GET", undefined, {});
};

export const post = async <T>(url: string, body: any): Promise<T> => {
  const headers = { "Content-Type": "application/json" };
  return request<T>(url, "POST", body, headers);
};
