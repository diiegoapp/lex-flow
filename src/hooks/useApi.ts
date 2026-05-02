import { useRef, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://lexflow-api.datrym.com';

const normalizeUrl = (url: string) =>
  url
    .replace('http://localhost:3001', API_BASE_URL)
    .replace('http://127.0.0.1:3001', API_BASE_URL);

export function useApi() {
  const controllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const request = useCallback(async <T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> => {
    controllerRef.current = new AbortController();

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controllerRef.current.signal,
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }, []);

  return { request, abort, normalizeUrl };
}
