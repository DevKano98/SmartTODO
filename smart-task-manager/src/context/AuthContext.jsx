import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../services/firebase.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoize auth functions
  const register = useCallback(async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      return userCredential.user;
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Failed to create an account";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak";
      }
      
      throw new Error(errorMessage);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Failed to sign in";
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      }
      
      throw new Error(errorMessage);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Google Sign In error:', error);
      throw new Error('Failed to sign in with Google');
    }
  }, []);

  // Optimize auth state listener
  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (mounted) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    loginWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
