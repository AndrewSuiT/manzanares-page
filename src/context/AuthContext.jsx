import { createContext, useContext, useEffect, useState } from 'react';
// Importamos getAdditionalUserInfo
import { signInWithPopup, signOut, onAuthStateChanged, getAdditionalUserInfo } from 'firebase/auth'; 
import { auth, googleProvider } from '../config/firebase';

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
      // Verificamos si es un usuario nuevo
      const { isNewUser } = getAdditionalUserInfo(result); 
      return { user: result.user, isNewUser }; // Retornamos el resultado
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