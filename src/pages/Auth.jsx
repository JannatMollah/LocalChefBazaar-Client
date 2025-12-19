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
    const [isLoading, setIsLoading] = useState(false);
    const { user, signIn, signUp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate("/");
    }, [user, navigate]);

    const loginForm = useForm({ 
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });
    
    const registerForm = useForm({ 
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            profileImage: "",
            address: "",
            password: "",
            confirmPassword: ""
        }
    });

    const handleLogin = async (data) => {
        setIsLoading(true);
        try {
            const res = await signIn(data.email, data.password);
            if (!res?.error) {
                navigate("/");
            }
        } catch (error) {
            console.error("Login failed:", error);
            // Optionally show error message to user
            loginForm.setError("root", {
                type: "manual",
                message: "Login failed. Please check your credentials."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (data) => {
        setIsLoading(true);
        try {
            const res = await signUp({
                email: data.email,
                password: data.password,
                fullName: data.fullName,
                image: data.profileImage,
                address: data.address,
            });

            if (res?.user) {
                navigate("/");
            }
        } catch (error) {
            console.error("Register failed:", error);
            // Optionally show error message to user
            registerForm.setError("root", {
                type: "manual",
                message: "Registration failed. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setIsLoading(false);
        // Clear any existing errors when switching forms
        loginForm.clearErrors();
        registerForm.clearErrors();
    };

    return (
        <div className="min-h-screen pt-20 pb-6 flex items-center justify-center bg-[#FBF7F4] px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <ChefHat className="w-9 h-9 text-[#DF603A]" />
                    <span className="playfair-font text-2xl font-bold">
                        Local Chef<span className="text-[#DF603A]"> Bazaar</span>
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

                {/* Error Messages */}
                {loginForm.formState.errors.root && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm text-center">
                            {loginForm.formState.errors.root.message}
                        </p>
                    </div>
                )}
                
                {registerForm.formState.errors.root && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm text-center">
                            {registerForm.formState.errors.root.message}
                        </p>
                    </div>
                )}

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
                            error={loginForm.formState.errors.email}
                        />

                        <div>
                            <label className="text-sm font-medium">Password</label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...loginForm.register("password")}
                                    className={`w-full rounded-xl border ${loginForm.formState.errors.password ? 'border-red-500' : 'border-gray-300'} pl-10 pr-10 py-2 focus:outline-none focus:border-[#DF603A]`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {loginForm.formState.errors.password && (
                                <p className="text-red-500 text-xs mt-1">
                                    {loginForm.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full ${isLoading ? 'bg-[#DF603A]/80' : 'bg-[#DF603A]'} text-white py-3 rounded-xl font-medium hover:bg-[#c95432] transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-dots loading-md"></span>
                                    Signing In...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                )}

                {/* REGISTER */}
                {!isLogin && (
                    <form
                        onSubmit={registerForm.handleSubmit(handleRegister)}
                        className="space-y-3"
                    >
                        <Input 
                            label="Full Name" 
                            icon={User} 
                            register={registerForm.register("fullName")} 
                            error={registerForm.formState.errors.fullName}
                        />
                        <Input 
                            label="Email Address" 
                            icon={Mail} 
                            type="email" 
                            register={registerForm.register("email")} 
                            error={registerForm.formState.errors.email}
                        />
                        <Input 
                            label="Profile Image URL" 
                            icon={ImageIcon} 
                            register={registerForm.register("profileImage")} 
                            error={registerForm.formState.errors.profileImage}
                        />
                        <Input 
                            label="Address" 
                            icon={MapPin} 
                            register={registerForm.register("address")} 
                            error={registerForm.formState.errors.address}
                        />
                        <Input 
                            label="Password" 
                            icon={Lock} 
                            type="password" 
                            register={registerForm.register("password")} 
                            error={registerForm.formState.errors.password}
                        />
                        <Input 
                            label="Confirm Password" 
                            icon={Lock} 
                            type="password" 
                            register={registerForm.register("confirmPassword")} 
                            error={registerForm.formState.errors.confirmPassword}
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full ${isLoading ? 'bg-[#DF603A]/80' : 'bg-[#DF603A]'} text-white py-3 rounded-xl font-medium hover:bg-[#c95432] transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-dots loading-md"></span>
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>
                )}

                {/* Toggle */}
                <p className="text-center text-sm mt-6">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        onClick={toggleForm}
                        disabled={isLoading}
                        className="text-[#DF603A] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLogin ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;

/* Reusable Input Component */
const Input = ({ label, icon: Icon, register, type = "text", error }) => (
    <div>
        <label className="text-sm font-medium">{label}</label>
        <div className="relative mt-1">
            <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 ${error ? 'text-red-400' : 'text-gray-400'} w-5 h-5`} />
            <input
                type={type}
                {...register}
                className={`w-full rounded-xl border ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#DF603A]'} pl-10 py-2 focus:outline-none transition-colors`}
                disabled={register.disabled}
            />
        </div>
        {error && (
            <p className="text-red-500 text-xs mt-1">
                {error.message}
            </p>
        )}
    </div>
);