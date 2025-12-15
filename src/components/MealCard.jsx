const MealCard = ({ meal }) => {
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition">
      <img
        src={meal.image}
        alt={meal.title}
        className="h-48 w-full object-cover"
      />

      <div className="p-4">
        <h3 className="text-lg font-semibold">{meal.title}</h3>

        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
          {meal.description}
        </p>

        <div className="flex justify-between items-center mt-4">
          <span className="text-primary font-bold text-lg">
            ৳ {meal.price}
          </span>

          <button className="px-4 py-2 text-sm rounded bg-primary text-white">
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealCard;
