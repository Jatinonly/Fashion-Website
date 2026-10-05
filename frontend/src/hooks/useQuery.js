import { useEffect, useState } from 'react'

/**
 * Minimal data-fetching hook for the service layer.
 * `key` must uniquely describe the request (it re-runs when the key changes);
 * pass `null` to skip. `keepPreviousData` keeps showing the last result while refetching. Swap for TanStack Query later if caching is needed.
 */
export function useQuery(key, fetcher, options = {}) {
  const [state, setState] = useState({ key: null, data: undefined, error: null })

  useEffect(() => {
    if (key === null) return
    let active = true
    fetcher().then(
      (data) => active && setState({ key, data, error: null }),
      (error) =>
        active &&
        setState({
          key,
          data: undefined,
          error: error instanceof Error ? error : new Error(String(error)),
        }),
    )
    return () => {
      active = false
    }
    // `key` encodes every input of `fetcher`, so it is the only dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const settled = state.key === key
  return {
    data: settled || options.keepPreviousData ? state.data : undefined,
    error: settled ? state.error : null,
    loading: key !== null && !settled,
  }
}
