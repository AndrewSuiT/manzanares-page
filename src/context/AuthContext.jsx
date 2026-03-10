import { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, getAdditionalUserInfo } from 'firebase/auth'; 
import { auth, googleProvider } from '../config/firebase';
import { api } from '../services/api'; // ← agregar este import

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { isNewUser } = getAdditionalUserInfo(result);

      // ── Vincular historial anónimo al uid real ──────────────
      const anonId = localStorage.getItem('anon_id');
      if (anonId) {
        try {
          await api.mergeTrackingEvents(anonId, result.user.uid);
          localStorage.removeItem('anon_id'); // ya no se necesita
        } catch (e) {
          console.warn('No se pudo mergear el tracking anónimo:', e);
          // No es crítico, no bloqueamos el login
        }
      }
      // ───────────────────────────────────────────────────────

      return { user: result.user, isNewUser };
    } catch (error) {
      console.error("Error al loguearse:", error);
      return null;
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);