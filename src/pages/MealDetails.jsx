import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Star,
  Clock,
  MapPin,
  ChefHat,
  Heart,
  ShoppingCart,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import {
  getMealById,
  addFavorite,
  removeFavorite,
  placeOrder,
} from "../api/meal.api";

const MealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ---------- fetch meal ---------- */
  const { data: meal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => getMealById(id),
  });

  /* ---------- favorite ---------- */
  const favoriteMutation = useMutation({
    mutationFn: addFavorite,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: removeFavorite,
  });

  /* ---------- order ---------- */
  const orderMutation = useMutation({
    mutationFn: placeOrder,
  });

  if (isLoading) {
    return <div className="text-center py-32">Loading meal...</div>;
  }

  if (!meal) {
    return <div className="text-center py-32">Meal not found</div>;
  }

  const handleFavorite = () => {
    if (!user) return navigate("/auth");

    favoriteMutation.mutate({
      mealId: meal._id,
      foodName: meal.foodName,
      foodImage: meal.foodImage,
      price: meal.price,
    });
  };

  const handleOrder = () => {
    if (!user) return navigate("/auth");

    orderMutation.mutate({
      mealId: meal._id,
      chefId: meal.chefId,
      price: meal.price,
    });

    navigate(`/checkout/${meal._id}`);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pt-28 pb-20">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="relative rounded-3xl overflow-hidden">
          <img
            src={meal.foodImage}
            alt={meal.foodName}
            className="w-full h-[420px] object-cover"
          />
          <button
            onClick={handleFavorite}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur p-3 rounded-full hover:scale-110 transition"
          >
            <Heart className="text-[#DF603A]" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <h1 className="playfair-font text-4xl font-bold text-[#2D1B12]">
            {meal.foodName}
          </h1>

          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              {meal.rating || 0}
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              {meal.estimatedDeliveryTime}
            </div>
          </div>

          <p className="text-gray-600">{meal.description}</p>

          {/* Chef */}
          <div className="bg-[#FBF5F1] p-5 rounded-xl">
            <div className="flex items-center gap-3">
              <ChefHat className="text-[#DF603A]" />
              <div>
                <p className="font-semibold">{meal.chefName}</p>
                <p className="text-sm text-gray-500">
                  {meal.chefExperience}
                </p>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="font-semibold mb-2">Ingredients</h3>
            <div className="flex flex-wrap gap-2">
              {meal.ingredients?.map((i, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                >
                  {i}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} />
            {meal.deliveryArea || "Dhaka"}
          </div>

          {/* Price + Order */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-3xl font-bold text-[#DF603A]">
              ৳{meal.price}
            </span>
            <button
              onClick={() => navigate(`/payment/${meal._id}`)}
              className="flex items-center gap-2 px-6 py-3 bg-[#DF603A] text-white rounded-xl hover:bg-[#c95432] transition"
            >
              <ShoppingCart size={18} />
              Order Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MealDetails;
