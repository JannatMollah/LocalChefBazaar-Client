import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMealById } from "@/api/meal.api";
import { Button } from "@/components/ui/button";

const MealDetails = () => {
  const { id } = useParams();

  const { data: meal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => getMealById(id),
  });

  if (isLoading) return <p className="py-20 text-center">Loading...</p>;

  return (
    <section className="container mx-auto px-4 py-20 grid md:grid-cols-2 gap-10">
      <img src={meal.foodImage} className="rounded-xl" />

      <div>
        <h1 className="playfair-font text-4xl font-bold mb-2">
          {meal.foodName}
        </h1>
        <p className="text-muted-foreground mb-4">
          by {meal.chefName}
        </p>

        <p className="text-2xl font-bold text-primary mb-6">
          ৳ {meal.price}
        </p>

        <Button size="lg">Order Now</Button>
      </div>
    </section>
  );
};

export default MealDetails;
