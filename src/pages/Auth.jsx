import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChefHat,
  Mail,
  Lock,
  User,
  MapPin,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import useAuth from "../hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    profileImage: z.string().url(),
    address: z.string().min(5),
    password: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm({ resolver: zodResolver(registerSchema) });

  const handleLogin = async (data) => {
    const res = await signIn(data.email, data.password);
    if (!res?.error) navigate("/");
  };

  const handleRegister = async (data) => {
    const res = await signUp(data.email, data.password, {
      name: data.fullName,
      image: data.profileImage,
      address: data.address,
    });
    if (!res?.error) navigate("/");
  };

  return (
    <div className="min-h-screen pt-20 pb-6 flex items-center justify-center bg-[#FBF7F4] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <ChefHat className="w-9 h-9 text-[#DF603A]" />
          <span className="playfair-font text-2xl font-bold">
            LocalChefBazaar
          </span>
        </div>

        <h2 className="playfair-font text-center text-2xl font-semibold mb-1">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          {isLogin
            ? "Sign in to your account"
            : "Join LocalChefBazaar today"}
        </p>

        {/* LOGIN */}
        {isLogin && (
          <form
            onSubmit={loginForm.handleSubmit(handleLogin)}
            className="space-y-4"
          >
            <Input
              label="Email Address"
              icon={Mail}
              type="email"
              register={loginForm.register("email")}
            />

            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...loginForm.register("password")}
                  className="w-full rounded-xl border border-gray-300 pl-10 pr-10 py-2 focus:outline-none focus:border-[#DF603A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="w-full bg-[#DF603A] text-white py-3 rounded-xl font-medium hover:bg-[#c95432] transition">
              Sign In
            </button>
          </form>
        )}

        {/* REGISTER */}
        {!isLogin && (
          <form
            onSubmit={registerForm.handleSubmit(handleRegister)}
            className="space-y-1"
          >
            <Input label="Full Name" icon={User} register={registerForm.register("fullName")} />
            <Input label="Email Address" icon={Mail} type="email" register={registerForm.register("email")} />
            <Input label="Profile Image URL" icon={ImageIcon} register={registerForm.register("profileImage")} />
            <Input label="Address" icon={MapPin} register={registerForm.register("address")} />
            <Input label="Password" icon={Lock} type="password" register={registerForm.register("password")} />
            <Input label="Confirm Password" icon={Lock} type="password" register={registerForm.register("confirmPassword")} />

            <button className="w-full bg-[#DF603A] text-white py-3 rounded-xl font-medium hover:bg-[#c95432] transition">
              Create Account
            </button>
          </form>
        )}

        {/* Toggle */}
        <p className="text-center text-sm mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#DF603A] font-medium hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;

/* Reusable Input */
const Input = ({ label, icon: Icon, register, type = "text" }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <div className="relative mt-1">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type={type}
        {...register}
        className="w-full rounded-xl border border-gray-300 pl-10 py-2 focus:outline-none focus:border-[#DF603A]"
      />
    </div>
  </div>
);
