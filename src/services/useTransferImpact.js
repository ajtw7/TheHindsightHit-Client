import { useState, useEffect } from 'react';
import { cacheGet, cacheSet, TTL } from '../utils/cache';

export default function useTransferImpact(mgrId) {
  const [transferImpact, setTransferImpact] = useState(() => {
    if (!mgrId) return null;
    return cacheGet(`transfer_impact_${mgrId}`) ?? null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mgrId) return;
    if (transferImpact) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/${mgrId}/transfer-impact`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setTransferImpact(data);
        cacheSet(`transfer_impact_${mgrId}`, data, TTL.TRANSFERS);
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
