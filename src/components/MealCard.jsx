import { Star, Clock, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const MealCard = ({ meal }) => {
  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-[#EFE7E1] hover:shadow-xl transition-all duration-300">
      
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={meal.foodImage}
          alt={meal.foodName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Rating */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg flex items-center gap-1">
          <Star className="w-4 h-4 text-[#F4B400] fill-[#F4B400]" />
          <span className="text-sm font-medium">
            {meal.rating || 0}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <div>
          <h3 className="playfair-font text-lg font-semibold text-[#2D1B12]">
            {meal.foodName}
          </h3>
          <p className="text-sm text-gray-500">
            by {meal.chefName}
          </p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>Dhaka</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{meal.estimatedDeliveryTime || "30-45 min"}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#EFE7E1]">
          <span className="text-2xl font-bold text-[#DF603A]">
            ৳{meal.price}
          </span>

          <Link
            to={`/meals/${meal._id}`}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#DF603A] text-white text-sm font-medium hover:bg-[#c95432] transition"
          >
            See Details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MealCard;
