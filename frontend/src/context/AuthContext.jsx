import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null); // the user from our MongoDB
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Find existing user in DB, or wait until they sign in & send data to /api/auth/google
        try {
          // A real app would verify JWT, we will just use a GET or rely on login to set it
          // For MVP we will set it during login popup.
          const storedUser = localStorage.getItem('dbUser');
          if (storedUser) {
            setDbUser(JSON.parse(storedUser));
          }
        } catch (err) { }
      } else {
        setDbUser(null);
        localStorage.removeItem('dbUser');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithGoogle = async (role = 'Customer', panOrGstin = '') => {
    const result = await signInWithPopup(auth, googleProvider);
    const { user } = result;
    // Send to backend
    const res = await axios.post('http://localhost:5000/api/auth/google', {
      name: user.displayName,
      email: user.email,
      googleId: user.uid,
      role,
      panOrGstin
    });
    setDbUser(res.data);
    localStorage.setItem('dbUser', JSON.stringify(res.data));
    return res.data;
  };

  const logout = () => {
    signOut(auth);
    setDbUser(null);
    localStorage.removeItem('dbUser');
  };

  const value = { currentUser, dbUser, loginWithGoogle, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
