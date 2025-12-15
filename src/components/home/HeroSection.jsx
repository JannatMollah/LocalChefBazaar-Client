import { Link } from "react-router-dom";
import { ArrowRight, Star, Clock, MapPin } from "lucide-react";
import heroImage from "../../assets/hero-food.jpg";

const HeroSection = () => {
  return (
    <section className="pt-28 pb-20 bg-[#FFF9F4]">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full">
            <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-sm font-medium text-orange-600">
              Rated 4.9/5 by 2000+ customers
            </span>
          </div>

          <h1 className="playfair-font text-5xl md:text-6xl font-bold leading-tight text-[#2B1E17]">
            Homemade Meals,{" "}
            <span className="text-orange-500">Delivered Fresh</span>
          </h1>

          <p className="text-gray-600 max-w-lg">
            Discover authentic, home-cooked dishes from talented local chefs in
            your neighborhood. Fresh ingredients, family recipes, and love in
            every bite.
          </p>

          <div className="flex gap-4">
            <Link
              to="/meals"
              className="bg-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2"
            >
              Explore Meals <ArrowRight size={18} />
            </Link>
            <Link
              to="/register"
              className="border border-gray-300 px-6 py-3 rounded-xl"
            >
              Become a Chef
            </Link>
          </div>

          <div className="flex gap-8 pt-4">
            <div className="flex items-center gap-2">
              <Clock className="text-green-600" />
              <div>
                <p className="font-semibold">30 min</p>
                <p className="text-sm text-gray-500">Avg delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-orange-500" />
              <div>
                <p className="font-semibold">50+ Areas</p>
                <p className="text-sm text-gray-500">Covered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="relative">
          <img
            src={heroImage}
            alt="Homemade food"
            className="rounded-3xl h-[500px] w-full object-cover"
          />

          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg">
            <p className="font-semibold">500+ Chefs</p>
            <p className="text-sm text-gray-500">
              Ready to cook for you
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
