import { ChefHat, Truck, Users, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: ChefHat, title: "Verified Chefs", desc: "Quality & hygiene checked." },
  { icon: Truck, title: "Fast Delivery", desc: "30–45 minutes delivery." },
  { icon: Users, title: "Community Driven", desc: "Support local cooks." },
  { icon: Shield, title: "Secure Payments", desc: "Safe transactions." },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-[#30231D] text-white">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <span className="px-4 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
            Why Choose Us
          </span>
          <h2 className="playfair-font text-4xl md:text-5xl font-bold">
            The Best Way to Enjoy{" "}
            <span className="text-orange-500">Homemade Food</span>
          </h2>
          <p className="text-gray-300">
            We connect passionate home cooks with hungry customers.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 rounded-xl"
          >
            Join as a Chef <ArrowRight />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/5 p-6 rounded-2xl border border-white/10"
            >
              <f.icon className="text-orange-500 mb-4" />
              <h3 className="playfair-font text-lg font-semibold">
                {f.title}
              </h3>
              <p className="text-sm text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
