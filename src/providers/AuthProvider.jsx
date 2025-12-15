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
    const [loading, setLoading] = useState(true);

    // REGISTER
    const signUp = async (email, password, fullName, image, address) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(result.user, {
            displayName: fullName,
            photoURL: image,
        });

        // 🔥 SAVE TO MONGODB
        await axios.post(`${import.meta.env.VITE_API_URL}/users`, {
            name: fullName,
            email,
            image,
            address,
            role: "user",        // default
            status: "active",
            createdAt: new Date(),
        });

        return result;
    };

    // LOGIN
    const signIn = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // LOGOUT
    const logOut = () => signOut(auth);

    // OBSERVER
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const authInfo = {
        user,
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
