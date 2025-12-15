import { createContext, useEffect, useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import app from "../firebase/firebase.config";
import axios from "axios";

export const AuthContext = createContext(null);
const auth = getAuth(app);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- SIGN UP ---------- */
  const signUp = async ({ email, password, fullName, image, address }) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(result.user, {
      displayName: fullName,
      photoURL: image,
    });

    // save to MongoDB
    await axios.post(`${import.meta.env.VITE_API_URL}/users`, {
      name: fullName,
      email,
      image,
      address,
    });

    return result;
  };

  /* ---------- LOGIN ---------- */
  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  /* ---------- LOGOUT ---------- */
  const logOut = async () => {
    await signOut(auth);
    setRole(null);
    setUser(null);
  };

  /* ---------- AUTH OBSERVER ---------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser?.email) {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/users/${currentUser.email}`
          );

          setRole(res.data?.role || "user");
        } catch (error) {
          console.error("Role fetch failed:", error);
          setRole("user");
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const authInfo = {
    user,
    role,        // ✅ THIS WAS MISSING BEFORE
    loading,
    signUp,
    signIn,
    logOut,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
