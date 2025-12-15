import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import axios from "axios";
import app from "../firebase/firebase.config";

const AuthContext = createContext(null);
const auth = getAuth(app);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser?.email) {
        // JWT from backend
        const jwtRes = await axios.post(
          "http://localhost:5000/jwt",
          { email: currentUser.email }
        );

        localStorage.setItem("access-token", jwtRes.data.token);

        // role from backend
        const roleRes = await axios.get(
          `http://localhost:5000/users/role/${currentUser.email}`,
          {
            headers: {
              authorization: `Bearer ${jwtRes.data.token}`,
            },
          }
        );

        setRole(roleRes.data.role);
      } else {
        localStorage.removeItem("access-token");
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem("access-token");
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
