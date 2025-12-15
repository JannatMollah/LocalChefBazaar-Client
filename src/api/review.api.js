import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const getReviewsByMeal = async (mealId) => {
  const res = await axios.get(`${API}/reviews?mealId=${mealId}`);
  return res.data;
};

export const addReview = async (reviewData) => {
  const token = localStorage.getItem("access-token");

  const res = await axios.post(`${API}/reviews`, reviewData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
