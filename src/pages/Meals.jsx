import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMeals } from "../api/meal.api";
import MealCard from "../components/MealCard";

const Meals = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("default");

  const { data, isLoading } = useQuery({
    queryKey: ["meals", page, sort],
    queryFn: () => getMeals({ page, sort }),
    keepPreviousData: true,
  });

  if (isLoading) return <p className="text-center py-20">Loading...</p>;

  const meals = data.meals;

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-12 space-y-4">
          <span className="px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
            Browse All
          </span>
          <h2 className="playfair-font text-4xl md:text-5xl font-bold">
            Explore <span className="text-orange-500">Delicious Meals</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Find your next favorite meal from our talented local chefs. Fresh, homemade, and delivered to your door.
          </p>
        </div>

      {/* Sort */}
      <div className="flex justify-end mb-6">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="default">Default</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </div>

      {/* Meals Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal) => (
          <MealCard key={meal._id} meal={meal} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-10">
        {[...Array(data.totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-4 py-2 rounded ${
              page === i + 1 ? "bg-primary text-white" : "border"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </section>
  );
};

export default Meals;
