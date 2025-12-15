import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Sarah Ahmed",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    rating: 5,
    comment:
      "The best biriyani I've ever had outside of my grandmother's kitchen!",
    meal: "Spicy Chicken Biriyani",
  },
  {
    name: "Rafiq Hassan",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    rating: 5,
    comment:
      "LocalChefBazaar has changed how I eat. Fresh homemade food!",
    meal: "Beef Bhuna Special",
  },
  {
    name: "Nadia Sultana",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    rating: 4,
    comment:
      "Amazing quality food and supporting local home chefs feels great.",
    meal: "Fish Curry Platter",
  },
];

const ReviewsSection = () => {
  return (
    <section className="py-20 bg-[#FFF9F4]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 space-y-4">
          <span className="px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm">
            Testimonials
          </span>
          <h2 className="playfair-font text-4xl md:text-5xl font-bold">
            What Our <span className="text-orange-500">Customers Say</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow">
              <Quote className="text-orange-200 mb-4" />
              <p className="mb-4 text-gray-700">"{r.comment}"</p>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-4 h-4 ${
                      idx < r.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <img
                  src={r.image}
                  alt={r.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-sm text-gray-500">
                    Ordered: {r.meal}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
