import axiosPublic from "./axiosPublic";

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
