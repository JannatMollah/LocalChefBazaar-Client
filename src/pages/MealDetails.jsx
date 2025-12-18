import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Star,
  Clock,
  MapPin,
  ChefHat,
  Heart,
  ShoppingCart,
  User,
  Calendar,
  Check,
  Loader2,
  CreditCard,
  Shield,
  Truck
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import {
  getMealById,
  checkFavorite,
  addFavorite,
  removeFavorite,
  placeOrder,
  addToCart,
} from "../api/meal.api";
import { getReviewsByMeal, addReview } from "../api/review.api";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Review Schema with react-hook-form + zod
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

const MealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // React Hook Form for review
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  /* ---------- Add to Cart ---------- */
  const handleAddToCart = async () => {
    if (!user) {
      navigate("/auth", { state: { from: `/meals/${id}` } });
      return;
    }

    if (role === "chef" || role === "admin") {
      Swal.fire({
        title: "Restricted",
        text: `${role === "chef" ? "Chefs" : "Admins"} cannot add items to cart`,
        icon: "warning",
      });
      return;
    }

    setCartLoading(true);

    try {
      // addToCart ফাংশন import করতে হবে meal.api.js থেকে
      await addToCart({
        mealId: meal._id,
        mealName: meal.foodName,
        price: meal.price,
        foodImage: meal.foodImage,
        chefName: meal.chefName,
        chefId: meal.chefId,
        quantity: 1,
      });

      Swal.fire({
        title: "Added to Cart! 🛒",
        text: `${meal.foodName} has been added to your shopping cart`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        position: "bottom-end",
        toast: true,
        background: "#10B981",
        color: "white",
      });

      // Cart count update করতে query invalidate করুন
      queryClient.invalidateQueries(["cart"]);
    } catch (error) {
      console.error("Cart error:", error);
      Swal.fire({
        title: "Oops!",
        text: "Failed to add item to cart. Please try again.",
        icon: "error",
      });
    } finally {
      setCartLoading(false);
    }
  };

  /* ---------- Fetch Meal ---------- */
  const {
    data: meal,
    isLoading: mealLoading,
    error: mealError,
  } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => getMealById(id),
    enabled: !!id,
  });

  /* ---------- Fetch Reviews ---------- */
  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getReviewsByMeal(id),
    enabled: !!id,
  });

  /* ---------- Check if already favorited ---------- */
  useQuery({
    queryKey: ["check-favorite", id, user?.email],
    queryFn: async () => {
      if (!user || !id) return false;
      try {
        const data = await checkFavorite(id, user.email);
        if (data.exists) {
          setIsFavorite(true);
          setFavoriteId(data.favoriteId);
        }
        return data.exists;
      } catch (error) {
        console.error("Error checking favorite:", error);
        return false;
      }
    },
    enabled: !!user && !!id,
  });

  /* ---------- Add to Favorite ---------- */
  const favoriteMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: (data) => {
      setIsFavorite(true);
      setFavoriteId(data.insertedId || data._id);
      Swal.fire({
        title: "Added to Favorites!",
        text: "This meal has been saved to your favorites.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      queryClient.invalidateQueries(["check-favorite", id, user?.email]);
    },
    onError: () => {
      Swal.fire({
        title: "Error",
        text: "Failed to add to favorites. Please try again.",
        icon: "error",
      });
    },
  });

  /* ---------- Remove from Favorite ---------- */
  const removeFavoriteMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      setIsFavorite(false);
      setFavoriteId(null);
      Swal.fire({
        title: "Removed from Favorites!",
        text: "This meal has been removed from your favorites.",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
      });
      queryClient.invalidateQueries(["check-favorite", id, user?.email]);
    },
    onError: () => {
      Swal.fire({
        title: "Error",
        text: "Failed to remove from favorites. Please try again.",
        icon: "error",
      });
    },
  });

  /* ---------- Submit Review ---------- */
  const reviewMutation = useMutation({
    mutationFn: addReview,
    onSuccess: () => {
      Swal.fire({
        title: "Review Submitted!",
        text: "Thank you for your feedback.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      reset();
      setShowReviewForm(false);
      refetchReviews(); // Refresh reviews list
      queryClient.invalidateQueries(["meal", id]); // Update meal rating if needed
    },
    onError: (error) => {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to submit review. Please try again.",
        icon: "error",
      });
    },
  });

  /* ---------- Handle Order ---------- */
  const handleOrder = () => {
    if (!user) {
      navigate("/auth", { state: { from: `/meals/${id}` } });
      return;
    }

    // Navigate to Order Page first (not directly to payment)
    navigate(`/order/${id}`);
  };

  /* ---------- Handle Favorite ---------- */
  const handleFavorite = () => {
    if (!user) {
      navigate("/auth", { state: { from: `/meals/${id}` } });
      return;
    }

    if (isFavorite && favoriteId) {
      removeFavoriteMutation.mutate(favoriteId);
    } else {
      favoriteMutation.mutate({
        mealId: meal._id,
        mealName: meal.foodName,
        chefId: meal.chefId,
        chefName: meal.chefName,
        price: meal.price,
      });
    }
  };

  /* ---------- Submit Review Form ---------- */
  const onSubmitReview = (data) => {
    if (!user) {
      navigate("/auth", { state: { from: `/meals/${id}` } });
      return;
    }

    const reviewData = {
      foodId: id,
      reviewerName: user.displayName || user.email.split("@")[0],
      reviewerImage: user.photoURL || "https://i.ibb.co/sample-user.jpg",
      rating: data.rating,
      comment: data.comment,
      userEmail: user.email,
    };

    reviewMutation.mutate(reviewData);
  };

  /* ---------- Loading & Error States ---------- */
  if (mealLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#DF603A] mx-auto" />
          <p className="text-gray-600">Loading delicious details...</p>
        </div>
      </div>
    );
  }

  if (mealError || !meal) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="playfair-font text-3xl text-gray-800">Meal Not Found</h2>
          <p className="text-gray-600">The meal you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/meals")}
            className="px-6 py-3 bg-[#DF603A] text-white rounded-xl"
          >
            Browse Meals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFAF8] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-gray-500">
          <span className="hover:text-[#DF603A] cursor-pointer" onClick={() => navigate("/")}>
            Home
          </span>{" "}
          /{" "}
          <span className="hover:text-[#DF603A] cursor-pointer" onClick={() => navigate("/meals")}>
            Meals
          </span>{" "}
          / <span className="text-[#2D1B12] font-medium">{meal.foodName}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Image & Chef Info */}
          <div className="space-y-8">
            {/* Image with Favorite Button */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <img
                src={meal.foodImage}
                alt={meal.foodName}
                className="w-full h-[450px] object-cover transition-transform duration-700 hover:scale-105"
              />

              {/* Favorite Button */}
              <button
                onClick={handleFavorite}
                disabled={favoriteMutation.isLoading || removeFavoriteMutation.isLoading}
                className="absolute top-6 right-6 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 disabled:opacity-50"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {favoriteMutation.isLoading || removeFavoriteMutation.isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#DF603A]" />
                ) : (
                  <Heart
                    className={`w-7 h-7 ${isFavorite
                      ? "fill-[#DF603A] text-[#DF603A] animate-pulse"
                      : "text-gray-400 hover:text-[#DF603A]"
                      }`}
                  />
                )}
              </button>

              {/* Meal Badge */}
              <div className="absolute bottom-6 left-6">
                <span className="px-4 py-2 bg-[#DF603A] text-white rounded-full text-sm font-medium">
                  {meal.category || "Special"}
                </span>
              </div>
            </div>

            {/* Chef Card */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-[#EFE7E1]">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#DF603A] to-orange-300 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="playfair-font text-xl font-bold text-[#2D1B12]">
                        {meal.chefName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Chef ID: {meal.chefId}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Verified
                    </span>
                  </div>
                  <p className="mt-3 text-gray-600">{meal.chefExperience}</p>
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>4.9 • 200+ Reviews</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>98% Satisfaction</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            {/* Title & Rating */}
            <div>
              <h1 className="playfair-font text-4xl md:text-5xl font-bold text-[#2D1B12] leading-tight">
                {meal.foodName}
              </h1>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < (meal.rating || 0)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-700 font-medium">
                    {meal.rating || 0} ({reviews.length} reviews)
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-300" />
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{meal.estimatedDeliveryTime}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-lg leading-relaxed">
              {meal.description ||
                "A carefully crafted homemade meal made with fresh ingredients and traditional recipes. Each bite delivers authentic flavors that remind you of home cooking."}
            </p>

            {/* Price & Actions */}
            <div className="bg-gradient-to-r from-[#FFF5F0] to-orange-50 rounded-2xl p-6 border border-orange-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Price per serving</p>
                  <p className="playfair-font text-5xl font-bold text-[#DF603A] mt-2">
                    ৳{meal.price}
                    <span className="text-lg text-gray-400">/serving</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Free delivery on orders over ৳500
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={role === "chef" || role === "admin" || cartLoading}
                  className="group flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-[#DF603A] text-[#DF603A] rounded-xl hover:bg-[#DF603A] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cartLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-lg font-semibold">Add to Cart</span>
                    </>
                  )}
                </button>

                {/* Order Now Button */}
                <button
                  onClick={handleOrder}
                  disabled={role === "chef" || role === "admin"}
                  className="group flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#DF603A] to-orange-500 text-white rounded-xl hover:shadow-xl hover:shadow-orange-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-lg font-semibold">Order Now</span>
                </button>
              </div>

              {/* Role Restrictions */}
              {role === "chef" || role === "admin" ? (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700 text-center">
                    <span className="font-semibold">
                      {role === "chef" ? "Chefs" : "Admins"}
                    </span>{" "}
                    cannot {role === "chef" ? "order meals" : "place orders"} -{" "}
                    <span className="italic">Switch to user account</span>
                  </p>
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>30-45 min Delivery</span>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-orange-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#2D1B12]">
                    {meal.rating || "4.5"}
                  </p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#2D1B12]">
                    {reviews.length}
                  </p>
                  <p className="text-xs text-gray-500">Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#2D1B12]">
                    {meal.estimatedDeliveryTime?.split(" ")[0] || "30"}
                  </p>
                  <p className="text-xs text-gray-500">Minutes</p>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="playfair-font text-2xl font-bold text-[#2D1B12] mb-4">
                Ingredients
              </h3>
              <div className="flex flex-wrap gap-3">
                {meal.ingredients?.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-[#FBF5F1] text-[#2D1B12] rounded-full border border-[#EFE7E1] hover:border-[#DF603A] transition-colors"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#DF603A]" />
                <div>
                  <p className="text-sm text-gray-500">Delivery Area</p>
                  <p className="font-medium">{meal.deliveryArea || "Dhaka City"}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#DF603A]" />
                <div>
                  <p className="text-sm text-gray-500">Available Days</p>
                  <p className="font-medium">Mon-Sun</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="playfair-font text-3xl font-bold text-[#2D1B12]">
                Customer Reviews
              </h2>
              <p className="text-gray-600 mt-2">
                What people are saying about this meal • {reviews.length} reviews
              </p>
            </div>
            <button
              onClick={() => {
                if (!user) {
                  navigate("/auth");
                  return;
                }
                setShowReviewForm(!showReviewForm);
              }}
              className="px-6 py-3 bg-[#2D1B12] text-white rounded-xl hover:bg-[#3a2a1f] transition"
            >
              {showReviewForm ? "Cancel Review" : "Write a Review"}
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-10 bg-white rounded-2xl p-6 shadow-lg border">
              <h3 className="playfair-font text-xl font-bold mb-4">Share Your Experience</h3>
              <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-6">
                {/* Rating Stars */}
                <div>
                  <label className="block text-sm font-medium mb-2">Your Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          const event = { target: { value: star.toString() } };
                          register("rating").onChange(event);
                        }}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${star <= (register("rating").value || 5)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                  <input type="hidden" {...register("rating", { valueAsNumber: true })} />
                  {errors.rating && (
                    <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium mb-2">Your Review</label>
                  <textarea
                    {...register("comment")}
                    rows="4"
                    className="w-full rounded-xl border border-gray-300 p-4 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                    placeholder="Tell us about your experience with this meal..."
                  />
                  {errors.comment && (
                    <p className="text-red-500 text-sm mt-1">{errors.comment.message}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-2 border rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewMutation.isLoading}
                    className="px-6 py-2 bg-[#DF603A] text-white rounded-xl disabled:opacity-50"
                  >
                    {reviewMutation.isLoading ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviewsLoading ? (
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                <p className="mt-2 text-gray-500">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl">
                <User className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="mt-3 text-gray-500">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <img
                        src={review.reviewerImage}
                        alt={review.reviewerName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold">{review.reviewerName}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealDetails;