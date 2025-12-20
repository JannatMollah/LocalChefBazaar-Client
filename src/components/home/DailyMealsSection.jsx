import { Link } from "react-router-dom";
import { Star, Clock, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosSecure from "../../api/axiosSecure";

const DailyMealsSection = () => {
  const { data: meals = [] } = useQuery({
    queryKey: ["daily-meals"],
    queryFn: async () => {
      const res = await axiosSecure.get("/meals");
      return res.data.meals;
    },
  });

  return (
    <section className="py-20 bg-[#FFF9F4]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
            Fresh Today
          </span>
          <h2 className="playfair-font text-4xl md:text-5xl font-bold">
            Today's <span className="text-orange-500">Special Menu</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Discover our chef's handpicked selections for today.
          </p>
        </div>

        {/* Meals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <div
              key={meal._id}
              className="bg-[#FFF9F4] rounded-2xl overflow-hidden shadow"
            >
              {/* Image */}
              <div className="relative h-48">
                <img
                  src={meal.foodImage}
                  alt={meal.foodName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded flex gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm">{meal.rating || 0}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <h3 className="playfair-font text-lg font-semibold">
                  {meal.foodName}
                </h3>
                <p className="text-sm text-gray-500">
                  by {meal.chefName}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={14} />
                  <span>{meal.estimatedDeliveryTime}</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-500/30">
                  <span className="text-xl font-bold text-orange-500">
                    ৳{meal.price}
                  </span>
                  <Link
                    to={`/meals/${meal._id}`}
                    className="bg-[#E26F4C] text-white px-4 py-2 rounded-lg flex items-center gap-1"
                  >
                    See Details <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link
            to="/meals"
            className="border border-gray-500/30 px-6 py-3 rounded-xl inline-flex items-center gap-2"
          >
            View All Meals <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DailyMealsSection;
