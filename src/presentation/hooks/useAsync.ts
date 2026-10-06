import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T; refreshing: boolean }
  | { status: 'error'; error: Error };

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function useAsync<T>(load: (options: { refresh: boolean }) => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const requestId = useRef(0);

  const run = useCallback(
    (refresh: boolean) => {
      const id = ++requestId.current;
      load({ refresh })
        .then((data) => {
          if (id === requestId.current) setState({ status: 'success', data, refreshing: false });
        })
        .catch((error: unknown) => {
          if (id === requestId.current) setState({ status: 'error', error: toError(error) });
        });
    },
    [load],
  );

  useEffect(() => {
    const ids = requestId;
    run(false);
    return () => {
      ids.current++;
    };
  }, [run]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    run(false);
  }, [run]);

  const refresh = useCallback(() => {
    setState((current) =>
      current.status === 'success' ? { ...current, refreshing: true } : { status: 'loading' },
    );
    run(true);
  }, [run]);

  return { state, retry, refresh };
}
