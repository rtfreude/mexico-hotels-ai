import { useState, useCallback, useEffect } from 'react';
import fetchPublishedHotels from './useSanityHotels';

// Lightweight React hook that fetches published hotels and exposes loading/error state.
export function usePublishedHotels({ autoLoad = true } = {}) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchPublishedHotels();
      if (Array.isArray(results)) setHotels(results);
      else setHotels([]);
    } catch (err) {
      setError(err);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) load();
  }, [autoLoad, load]);

  return { hotels, setHotels, loading, error, reload: load };
}

export default usePublishedHotels;
