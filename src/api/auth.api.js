import axiosPublic from "./axiosPublic";
import axiosSecure from "./axiosSecure";

/* ---------- get JWT token ---------- */
export const getJWT = async (email) => {
  const res = await axiosPublic.post("/auth/jwt", { email });
  return res.data;
};

/* ---------- get user role ---------- */
export const getUserRole = async (email) => {
  const res = await axiosSecure.get(`/users/role/${email}`);
  return res.data;
};

export const updateUserProfile = async (userData) => {
  try {
    const res = await axiosSecure.put("/auth/profile", userData);
    return res.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};