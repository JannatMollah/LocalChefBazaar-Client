import axiosPublic from "./axiosPublic";
import axiosSecure from "./axiosSecure";

// MEALS LIST (PAGINATION + SORT)
export const getMeals = async ({ page = 1, sort = "default" }) => {
  try {
    const res = await axiosPublic.get(`/meals?page=${page}&sort=${sort}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching meals:", error);
    return { meals: [], total: 0, totalPages: 0 };
  }
};

// SINGLE MEAL
export const getMealById = async (id) => {
  try {
    const res = await axiosPublic.get(`/meals/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching meal:", error);
    return null;
  }
};

// CHECK IF MEAL IS IN FAVORITES
export const checkFavorite = async (mealId, userEmail) => {
  try {
    const res = await axiosSecure.get(
      `/favorites/check?mealId=${mealId}&userEmail=${userEmail}`
    );
    return res.data;
  } catch (error) {
    console.error("Error checking favorite:", error);
    return { exists: false, favoriteId: null };
  }
};

// ADD TO FAVORITE
export const addFavorite = async (favoriteData) => {
  try {
    const res = await axiosSecure.post("/favorites", favoriteData);
    return res.data;
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
};

// REMOVE FROM FAVORITE
export const removeFavorite = async (favoriteId) => {
  try {
    const res = await axiosSecure.delete(`/favorites/${favoriteId}`);
    return res.data;
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
};

// PLACE ORDER
export const placeOrder = async (orderData) => {
  try {
    const res = await axiosSecure.post("/orders", orderData);
    return res.data;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};

// GET MY ORDERS
export const getMyOrders = async () => {
  try {
    const res = await axiosSecure.get("/orders/my");
    return res.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// GET CHEF ORDERS
export const getChefOrders = async (chefId) => {
  try {
    const res = await axiosSecure.get(`/orders/chef/${chefId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching chef orders:", error);
    return [];
  }
};