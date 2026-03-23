import { useState, useEffect } from 'react';

/**
 * Fetches the user's server-side profile (isPro status) from GET /api/user/me.
 * Re-fetches whenever the Firebase user changes.
 *
 * @param {import('firebase/auth').User|null} user
 * @returns {{ isPro: boolean, loading: boolean }}
 */
const useUserProfile = (user) => {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsPro(false);
      return;
    }

    let stale = false;
    setLoading(true);

    user
      .getIdToken()
      .then((token) =>
        fetch(`${process.env.REACT_APP_API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then((res) => {
        if (!res.ok) throw new Error('profile fetch failed');
        return res.json();
      })
      .then((data) => {
        if (!stale) setIsPro(data.isPro ?? false);
      })
      .catch(() => {
        if (!stale) setIsPro(false);
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });

    return () => {
      stale = true;
    };
  }, [user]);

  return { isPro, loading };
};

export default useUserProfile;
