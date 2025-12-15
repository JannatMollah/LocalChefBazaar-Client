import axiosPublic from "./axiosPublic";
import axiosSecure from "./axiosSecure";

// meals list (pagination + sort)
export const getMeals = async ({ page = 1, sort = "default" }) => {
  const res = await axiosPublic.get(`/meals?page=${page}&sort=${sort}`);
  return res.data;
};

// single meal
export const getMealById = async (id) => {
  const res = await axiosPublic.get(`/meals/${id}`);
  return res.data;
};

export const addFavorite = async (meal) => {
  const res = await axiosSecure.post("/favorites", meal);
  return res.data;
};

export const removeFavorite = async (id) => {
  const res = await axiosSecure.delete(`/favorites/${id}`);
  return res.data;
};

export const placeOrder = async (order) => {
  const res = await axiosSecure.post("/orders", order);
  return res.data;
};