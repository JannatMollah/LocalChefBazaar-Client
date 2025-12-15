import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

// meals list (pagination + sort)
export const getMeals = async ({ page = 1, sort = "default" }) => {
  const res = await API.get(`/meals?page=${page}&sort=${sort}`);
  return res.data;
};

// single meal
export const getMealById = async (id) => {
  const res = await API.get(`/meals/${id}`);
  return res.data;
};
