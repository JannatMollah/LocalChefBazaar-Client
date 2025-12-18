import axiosSecure from "./axiosSecure";

export const getFavoriteMeals = async () => {
  try {
    const res = await axiosSecure.get("/favorites");
    return res.data;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};

export const addToFavorites = async (mealId) => {
  try {
    const res = await axiosSecure.post("/favorites", { mealId });
    return res.data;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

export const removeFromFavorites = async (mealId) => {
  try {
    const res = await axiosSecure.delete(`/favorites/${mealId}`);
    return res.data;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};