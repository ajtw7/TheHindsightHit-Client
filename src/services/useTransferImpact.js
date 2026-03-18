import { useState, useEffect, useRef } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';

export default function useTransferImpact(mgrId) {
  const [transferImpact, setTransferImpact] = useState(() => {
    if (!mgrId) return null;
    return cacheGet(`transfer_impact_${mgrId}`) ?? null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const prevMgrId = useRef(mgrId);

  useEffect(() => {
    if (!mgrId) {
      setTransferImpact(null);
      setError(null);
      return;
    }

    // When mgrId changes, reset state and try cache for the new ID
    if (prevMgrId.current !== mgrId) {
      prevMgrId.current = mgrId;
      setError(null);
      const cached = cacheGet(`transfer_impact_${mgrId}`);
      if (cached) {
        setTransferImpact(cached);
        return;
      }
      setTransferImpact(null);
    } else if (transferImpact) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/${mgrId}/transfer-impact`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        // API returns { transfers: [...] }
        const transfers = data.transfers ?? data;
        setTransferImpact(transfers);
        cacheSet(`transfer_impact_${mgrId}`, transfers, TTL.TRANSFERS);
      } catch (err) {
        console.error('Error fetching transfer impact', err);
        setError(err.message || 'Failed to fetch transfer impact');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mgrId]);

  return { transferImpact, loading, error };
}
