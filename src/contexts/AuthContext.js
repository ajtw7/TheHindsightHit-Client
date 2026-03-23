import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import '../config/firebase'; // ensure app is initialised before getAuth()
import useUserProfile from '../services/useUserProfile';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Resolved after onAuthStateChanged fires on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  // Fetch server-side profile (isPro) whenever the signed-in user changes
  const { isPro, loading: profileLoading } = useUserProfile(user);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const signInWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signUp = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const signOut = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: authLoading || profileLoading,
        isPro,
        signInWithGoogle,
        signInWithEmail,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
