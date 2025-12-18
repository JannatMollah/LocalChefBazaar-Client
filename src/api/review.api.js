import axiosSecure from "./axiosSecure";

const API = import.meta.env.VITE_API_URL;

// GET REVIEWS BY MEAL ID
export const getReviewsByMeal = async (mealId) => {
  try {
    const res = await axiosSecure.get(`/reviews/food/${mealId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

// ADD NEW REVIEW
export const addReview = async (reviewData) => {
  try {
    const res = await axiosSecure.post("/reviews", reviewData);
    return res.data;
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

// GET MY REVIEWS
export const getMyReviews = async () => {
  try {
    const res = await axiosSecure.get("/reviews/my");
    return res.data;
  } catch (error) {
    console.error("Error fetching my reviews:", error);
    return [];
  }
};

// UPDATE REVIEW
export const updateReview = async (id, updatedData) => {
  try {
    const res = await axiosSecure.patch(`/reviews/${id}`, updatedData);
    return res.data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

// DELETE REVIEW
export const deleteReview = async (id) => {
  try {
    const res = await axiosSecure.delete(`/reviews/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};