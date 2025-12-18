import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Edit,
  Trash2,
  Filter,
  Search,
  MessageSquare,
  Calendar,
  ThumbsUp,
  Eye,
  AlertCircle,
  ChefHat,
} from "lucide-react";
import axiosSecure from "../../../api/axiosSecure";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const MyReviews = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Fetch user reviews
  const { data: reviews = [], isLoading, error: fetchError } = useQuery({
    queryKey: ["userReviews"],
    queryFn: async () => {
      try {
        const response = await axiosSecure.get("/reviews/my");
        return response.data;
      } catch (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }
    },
  });

  // Delete review mutation
  const deleteMutation = useMutation({
    mutationFn: async (reviewId) => {
      await axiosSecure.delete(`/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userReviews"]);
      Swal.fire("Deleted!", "Your review has been deleted.", "success");
    },
    onError: (error) => {
      Swal.fire("Error!", error.response?.data?.message || "Failed to delete review", "error");
    },
  });

  // Update review mutation
  const updateMutation = useMutation({
    mutationFn: async ({ reviewId, rating, comment }) => {
      await axiosSecure.patch(`/reviews/${reviewId}`, { rating, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userReviews"]);
      Swal.fire("Updated!", "Your review has been updated.", "success");
    },
    onError: (error) => {
      Swal.fire("Error!", error.response?.data?.message || "Failed to update review", "error");
    },
  });

  const filteredReviews = reviews.filter((review) => {
    // Filter by rating
    if (filter !== "all") {
      const rating = parseInt(filter);
      if (review.rating !== rating) return false;
    }
    
    // Search by meal name or comment
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        review.mealName?.toLowerCase().includes(searchLower) ||
        review.comment?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-600 bg-green-100";
    if (rating >= 3) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleEditReview = (review) => {
    Swal.fire({
      title: "Edit Review",
      html: `
        <div class="text-left space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select id="editRating" class="w-full border rounded-lg p-2">
              <option value="5" ${review.rating === 5 ? "selected" : ""}>⭐⭐⭐⭐⭐ (5)</option>
              <option value="4" ${review.rating === 4 ? "selected" : ""}>⭐⭐⭐⭐ (4)</option>
              <option value="3" ${review.rating === 3 ? "selected" : ""}>⭐⭐⭐ (3)</option>
              <option value="2" ${review.rating === 2 ? "selected" : ""}>⭐⭐ (2)</option>
              <option value="1" ${review.rating === 1 ? "selected" : ""}>⭐ (1)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea id="editComment" rows="3" class="w-full border rounded-lg p-2" placeholder="Share your experience...">${review.comment}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Update Review",
      preConfirm: () => {
        const rating = document.getElementById("editRating").value;
        const comment = document.getElementById("editComment").value;
        
        if (!rating || !comment) {
          Swal.showValidationMessage("Please fill all fields");
          return false;
        }
        
        return { rating: parseInt(rating), comment };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        updateMutation.mutate({
          reviewId: review._id,
          ...result.value
        });
      }
    });
  };

  const handleDeleteReview = (reviewId) => {
    Swal.fire({
      title: "Delete Review?",
      text: "Are you sure you want to delete this review? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(reviewId);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#DF603A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Reviews
          </h2>
          <p className="text-gray-600 mb-6">
            Failed to load your reviews. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#DF603A] text-white px-6 py-3 rounded-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFAF8] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="playfair-font text-4xl font-bold text-[#2D1B12] mb-2">
            My Reviews
          </h1>
          <p className="text-gray-600">Manage and view all your reviews</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-[#2D1B12]">{reviews.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-[#DF603A]" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-[#2D1B12]">
                  {reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : "0.0"}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">5-Star Reviews</p>
                <p className="text-2xl font-bold text-[#2D1B12]">
                  {reviews.filter(r => r.rating === 5).length}
                </p>
              </div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Latest Review</p>
                <p className="text-2xl font-bold text-[#2D1B12]">
                  {reviews.length > 0 
                    ? new Date(reviews[0].date).toLocaleDateString() 
                    : "N/A"}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-4 mb-6 border shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
            
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {reviews.length === 0 ? "No reviews yet" : "No matching reviews"}
            </h3>
            <p className="text-gray-600 mb-6">
              {reviews.length === 0 
                ? "You haven't written any reviews yet. Review your delivered orders!" 
                : "No reviews match your search criteria."}
            </p>
            <Link
              to="/dashboard/orders"
              className="inline-block bg-[#DF603A] text-white px-6 py-3 rounded-xl hover:bg-[#c95232] transition"
            >
              View Orders to Review
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review._id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <Link
                            to={`/meal/${review.foodId}`}
                            className="text-lg font-semibold text-[#2D1B12] hover:text-[#DF603A] transition"
                          >
                            {review.mealName || "Meal"}
                          </Link>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(review.rating)}`}>
                              {review.rating}.0
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Review Content */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-800">{review.comment}</p>
                      </div>
                      
                      {/* Reviewer Info */}
                      <div className="flex items-center gap-3 mt-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DF603A] to-orange-400 flex items-center justify-center">
                          <span className="text-white font-bold">
                            {review.reviewerName?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{review.reviewerName}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t">
                    <button
                      onClick={() => handleEditReview(review)}
                      disabled={updateMutation.isLoading}
                      className="flex items-center gap-2 bg-[#DF603A] text-white px-4 py-2 rounded-xl hover:bg-[#c95232] transition disabled:opacity-50"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Review
                    </button>
                    
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      disabled={deleteMutation.isLoading}
                      className="flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Review
                    </button>
                    
                    <Link
                      to={`/meals/${review.foodId}`}
                      className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                    >
                      <Eye className="w-4 h-4" />
                      View Meal
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Guidelines */}
        <div className="mt-8 bg-white rounded-2xl p-6 border">
          <h3 className="text-lg font-semibold text-[#2D1B12] mb-4">
            Review Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Be Specific</h4>
              <p className="text-sm text-blue-700">
                Mention specific aspects like taste, presentation, and delivery time.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Be Honest</h4>
              <p className="text-sm text-green-700">
                Share your genuine experience to help other customers make informed decisions.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Be Constructive</h4>
              <p className="text-sm text-purple-700">
                Provide helpful feedback that chefs can use to improve their service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReviews;