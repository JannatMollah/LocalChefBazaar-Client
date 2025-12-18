import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  ChefHat,
  LogOut,
  User,
  LayoutDashboard,
  ShoppingCart,
  Home,
  Utensils,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getCartItems } from "../api/cart.api";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logOut } = useAuth();

  // Fetch cart items count
  const { data: cartItems = [] } = useQuery({
    queryKey: ["cart"],
    queryFn: getCartItems,
    enabled: !!user,
  });

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  /* ---------- outside click close ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- nav links ---------- */
  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Meals", path: "/meals", icon: Utensils },
  ];

  // Add Cart link for logged in users
  if (user) {
    navLinks.push({ 
      name: "Cart", 
      path: "/cart", 
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : null
    });
  }

  // Add Dashboard links based on role
  if (role === "admin") {
    navLinks.push({ name: "Admin Dashboard", path: "/admin-dashboard", icon: LayoutDashboard });
  }

  if (role === "chef" || role === "admin") {
    navLinks.push({ name: "Chef Dashboard", path: "/chef-dashboard", icon: ChefHat });
  }

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logOut();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  /* ---------- avatar logic ---------- */
  const initials =
    user?.displayName?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* ---------- Logo ---------- */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DF603A] to-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ChefHat className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold playfair-font tracking-tight">
              Local Chef<span className="text-[#DF603A]"> Bazaar</span>
            </span>
          </Link>

          {/* ---------- Desktop Navigation ---------- */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all group"
                style={{ 
                  color: isActive(link.path) ? "#DF603A" : "#4B5563",
                  backgroundColor: isActive(link.path) ? "#FEF3F2" : "transparent"
                }}
              >
                {link.icon && <link.icon size={18} />}
                <span>{link.name}</span>
                
                {/* Cart Badge */}
                {link.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#DF603A] text-white text-xs rounded-full flex items-center justify-center">
                    {link.badge > 9 ? "9+" : link.badge}
                  </span>
                )}
                
                {/* Active Indicator */}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-[#DF603A] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* ---------- User Area / Auth Buttons ---------- */}
          <div className="hidden md:flex items-center gap-4 relative" ref={dropdownRef}>
            {!user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/auth"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#DF603A] transition"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#DF603A] to-orange-500 rounded-xl hover:shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <>
                {/* User Info & Avatar */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium text-gray-800">
                      {user.displayName || user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{role || "user"}</p>
                  </div>
                  
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#DF603A] transition-all group"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="profile"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#DF603A] to-orange-400 text-white font-medium">
                        {initials || <User size={18} />}
                      </div>
                    )}
                    
                    {/* Online Indicator */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  </button>
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-14 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    {/* User Info Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-[#FFF5F0] to-orange-50 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#DF603A] text-white font-bold">
                              {initials}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {user.displayName || "User"}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-[#DF603A]/10 text-[#DF603A] rounded-full capitalize">
                            {role || "user"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-2">
                      <DropdownItem 
                        label="My Profile" 
                        icon={User}
                        onClick={() => {
                          navigate("/dashboard/profile");
                          setDropdownOpen(false);
                        }} 
                      />
                      <DropdownItem 
                        label="My Orders" 
                        icon={ShoppingCart}
                        onClick={() => {
                          navigate("/dashboard/orders");
                          setDropdownOpen(false);
                        }} 
                      />
                      
                      {/* Cart with Count */}
                      <button
                        onClick={() => {
                          navigate("/cart");
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50 rounded-lg transition"
                      >
                        <div className="flex items-center gap-3">
                          <ShoppingCart size={18} className="text-gray-600" />
                          <span>Shopping Cart</span>
                        </div>
                        {cartCount > 0 && (
                          <span className="px-2 py-1 text-xs font-medium bg-[#DF603A] text-white rounded-full">
                            {cartCount}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Role-Specific Sections */}
                    {(role === "chef" || role === "admin") && (
                      <>
                        <div className="h-px bg-gray-100 my-1" />
                        <div className="p-2">
                          <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Chef Tools
                          </h4>
                          {role === "chef" && (
                            <>
                              <DropdownItem 
                                label="Create Meal" 
                                icon={Utensils}
                                onClick={() => {
                                  navigate("/chef-dashboard/create-meal");
                                  setDropdownOpen(false);
                                }} 
                              />
                              <DropdownItem 
                                label="My Meals" 
                                icon={ChefHat}
                                onClick={() => {
                                  navigate("/chef-dashboard/my-meals");
                                  setDropdownOpen(false);
                                }} 
                              />
                              <DropdownItem 
                                label="Order Requests" 
                                icon={LayoutDashboard}
                                onClick={() => {
                                  navigate("/chef-dashboard/order-requests");
                                  setDropdownOpen(false);
                                }} 
                              />
                            </>
                          )}
                          
                          {role === "admin" && (
                            <>
                              <DropdownItem 
                                label="Manage Users" 
                                icon={User}
                                onClick={() => {
                                  navigate("/admin-dashboard/manage-users");
                                  setDropdownOpen(false);
                                }} 
                              />
                              <DropdownItem 
                                label="Platform Stats" 
                                icon={LayoutDashboard}
                                onClick={() => {
                                  navigate("/admin-dashboard/statistics");
                                  setDropdownOpen(false);
                                }} 
                              />
                            </>
                          )}
                        </div>
                      </>
                    )}

                    {/* Logout */}
                    <div className="h-px bg-gray-100 mt-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ---------- Mobile Menu Toggle ---------- */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* ---------- Mobile Menu ---------- */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t animate-slideDown">
            {/* User Info for Mobile */}
            {user && (
              <div className="px-4 py-3 mb-3 bg-gradient-to-r from-[#FFF5F0] to-orange-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#DF603A] text-white font-bold">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {user.displayName || user.email.split('@')[0]}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{role || "user"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(link.path)
                      ? "bg-[#DF603A] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {link.icon && <link.icon size={20} />}
                  <span className="font-medium">{link.name}</span>
                  
                  {/* Cart Badge for Mobile */}
                  {link.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-white text-[#DF603A] rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile Auth / User Actions */}
            <div className="mt-4 pt-4 border-t space-y-2">
              {!user ? (
                <>
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-center font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-center font-medium text-white bg-gradient-to-r from-[#DF603A] to-orange-500 rounded-lg"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <User size={20} />
                    <span>My Profile</span>
                  </Link>
                  
                  {/* Cart with Count for Mobile */}
                  <Link
                    to="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart size={20} />
                      <span>Shopping Cart</span>
                    </div>
                    {cartCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-[#DF603A] text-white rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Role Specific Mobile Links */}
                  {(role === "chef" || role === "admin") && (
                    <div className="pl-4 mt-2 space-y-2">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {role === "chef" ? "Chef Tools" : "Admin Tools"}
                      </h4>
                      {role === "chef" && (
                        <>
                          <Link
                            to="/chef-dashboard/create-meal"
                            onClick={() => setMobileOpen(false)}
                            className="block py-2 text-gray-600 hover:text-[#DF603A]"
                          >
                            Create Meal
                          </Link>
                          <Link
                            to="/chef-dashboard/order-requests"
                            onClick={() => setMobileOpen(false)}
                            className="block py-2 text-gray-600 hover:text-[#DF603A]"
                          >
                            Order Requests
                          </Link>
                        </>
                      )}
                      {role === "admin" && (
                        <>
                          <Link
                            to="/admin-dashboard/manage-users"
                            onClick={() => setMobileOpen(false)}
                            className="block py-2 text-gray-600 hover:text-[#DF603A]"
                          >
                            Manage Users
                          </Link>
                        </>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg mt-2"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

/* ---------- Dropdown Item Component ---------- */
const DropdownItem = ({ label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
  >
    <Icon size={18} className="text-gray-600" />
    <span>{label}</span>
  </button>
);