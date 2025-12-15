import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMealById } from "../api/meal.api";
import CheckoutForm from "../components/CheckoutForm";

const Payment = () => {
  const { id } = useParams();

  const { data: meal } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => getMealById(id),
  });

  if (!meal) return null;

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <h2 className="text-2xl font-semibold mb-6">
        Pay for <span className="text-primary">{meal.foodName}</span>
      </h2>

      <CheckoutForm meal={meal} />
    </div>
  );
};

export default Payment;
