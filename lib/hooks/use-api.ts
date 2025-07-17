import { useState } from 'react';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const fetchData = async <R = T>(url: string, options?: RequestInit): Promise<R> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await response.json();
      setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({ data: null, error: errorMessage, loading: false });
      throw error;
    }
  };

  const postData = async <R = T>(url: string, body: unknown): Promise<R> => {
    return fetchData<R>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  const putData = async <R = T>(url: string, body: unknown): Promise<R> => {
    return fetchData<R>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  };

  const deleteData = async (url: string): Promise<void> => {
    await fetchData(url, {
      method: 'DELETE',
    });
  };

  return {
    ...state,
    fetchData,
    postData,
    putData,
    deleteData,
  };
} 