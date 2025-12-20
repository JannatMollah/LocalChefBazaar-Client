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
  Package,
  Star,
  Heart,
  BarChart3,
  Users,
  ClipboardCheck,
  Shield,
  Settings,
  Bell,
  Search,
  Bookmark,
  TrendingUp,
  Award,
  MapPin,
  CreditCard,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getCartItems } from "../api/cart.api";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

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

  // Outside click handlers
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logOut();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  // Avatar initials
  const initials = user?.displayName?.slice(0, 2).toUpperCase() || 
                   user?.email?.slice(0, 2).toUpperCase();

  // Render based on role
  const renderNavbarContent = () => {
    if (!user) {
      return (
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="hidden md:block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-[#DF603A] transition"
          >
            Login
          </Link>
          <Link
            to="/auth"
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#DF603A] to-orange-500 rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign Up
          </Link>
        </div>
      );
    }

    // User role navbar
    if (role === "user") {
      return (
        <>
          {/* Desktop Navigation for User */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${isActive("/") ? 'text-[#DF603A] bg-[#FEF3F2]' : 'text-gray-600 hover:text-[#DF603A] hover:bg-gray-50'}`}
            >
              <Home size={18} />
              <span>Home</span>
              {isActive("/") && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-[#DF603A] rounded-full" />}
            </Link>

            <Link
              to="/meals"
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${isActive("/meals") ? 'text-[#DF603A] bg-[#FEF3F2]' : 'text-gray-600 hover:text-[#DF603A] hover:bg-gray-50'}`}
            >
              <Utensils size={18} />
              <span>Meals</span>
              {isActive("/meals") && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-[#DF603A] rounded-full" />}
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all text-gray-600 hover:text-[#DF603A] hover:bg-gray-50"
            >
              <ShoppingCart size={18} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#DF603A] text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-gray-800">
                  {user.displayName || user.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
              
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#DF603A] transition-all">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#DF603A] to-orange-400 text-white font-medium">
                    {initials}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
            </button>

            {/* Dropdown Menu for User */}
            {dropdownOpen && (
              <div className="absolute right-0 top-14 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
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
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                        Premium Customer
                      </span>
                    </div>
                  </div>
                </div>

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
                    badge={cartCount > 0 ? cartCount : null}
                  />
                  <DropdownItem 
                    label="My Reviews" 
                    icon={Star}
                    onClick={() => {
                      navigate("/dashboard/reviews");
                      setDropdownOpen(false);
                    }} 
                  />
                  <DropdownItem 
                    label="Favorite Meals" 
                    icon={Heart}
                    onClick={() => {
                      navigate("/dashboard/favorites");
                      setDropdownOpen(false);
                    }} 
                  />
                  <DropdownItem 
                    label="Dashboard" 
                    icon={LayoutDashboard}
                    onClick={() => {
                      navigate("/dashboard");
                      setDropdownOpen(false);
                    }} 
                  />
                </div>

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
          </div>
        </>
      );
    }

    // Chef role navbar
    if (role === "chef") {
      return (
        <>
          {/* Desktop Navigation for Chef */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${isActive("/") ? 'text-[#DF603A] bg-[#FEF3F2]' : 'text-gray-600 hover:text-[#DF603A] hover:bg-gray-50'}`}
            >
              <Home size={18} />
              <span>Home</span>
              {isActive("/") && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-[#DF603A] rounded-full" />}
            </Link>

            <Link
              to="/meals"
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${isActive("/meals") ? 'text-[#DF603A] bg-[#FEF3F2]' : 'text-gray-600 hover:text-[#DF603A] hover:bg-gray-50'}`}
            >
              <Utensils size={18} />
              <span>Meals</span>
              {isActive("/meals") && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-[#DF603A] rounded-full" />}
            </Link>
          </div>

          {/* Chef Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-gray-800">
                  {user.displayName || "Chef"}
                </p>
                <p className="text-xs text-orange-600 font-medium">Verified Chef</p>
              </div>
              
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-orange-200 hover:border-[#DF603A] transition-all">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#DF603A] to-orange-400 text-white font-medium">
                    {initials}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
            </button>

            {/* Dropdown Menu for Chef */}
            {dropdownOpen && (
              <div className="absolute right-0 top-14 w-72 bg-white rounded-xl shadow-2xl border border-orange-100 overflow-hidden z-50">
                <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#DF603A] text-white font-bold">
                          <ChefHat size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {user.displayName || "Chef"}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-600 rounded-full">
                        Verifyed Chef
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <DropdownItem 
                    label="My Profile" 
                    icon={User}
                    onClick={() => {
                      navigate("/chef-dashboard/profile");
                      setDropdownOpen(false);
                    }} 
                  />
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
                    icon={Package}
                    onClick={() => {
                      navigate("/chef-dashboard/my-meals");
                      setDropdownOpen(false);
                    }}
                  />
                  <DropdownItem 
                    label="Order Requests" 
                    icon={ClipboardCheck}
                    onClick={() => {
                      navigate("/chef-dashboard/order-requests");
                      setDropdownOpen(false);
                    }}
                  />
                  <DropdownItem 
                    label="Dashboard" 
                    icon={LayoutDashboard}
                    onClick={() => {
                      navigate("/chef-dashboard");
                      setDropdownOpen(false);
                    }} 
                  />
                </div>

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
          </div>
        </>
      );
    }

    // Admin role navbar
    if (role === "admin") {
      return (
        <>
          {/* Desktop Navigation for Admin */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${isActive("/") ? 'text-[#DF603A] bg-[#FEF3F2]' : 'text-gray-600 hover:text-[#DF603A] hover:bg-gray-50'}`}
            >
              <Home size={18} />
              <span>Home</span>
              {isActive("/") && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-[#DF603A] rounded-full" />}
            </Link>

            <Link
              to="/meals"
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${isActive("/meals") ? 'text-[#DF603A] bg-[#FEF3F2]' : 'text-gray-600 hover:text-[#DF603A] hover:bg-gray-50'}`}
            >
              <Utensils size={18} />
              <span>Meals</span>
              {isActive("/meals") && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-[#DF603A] rounded-full" />}
            </Link>
          </div>

          {/* Admin Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-gray-800">
                  {user.displayName || "Admin"}
                </p>
                <p className="text-xs text-purple-600 font-medium">Super Admin</p>
              </div>
              
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200 hover:border-[#DF603A] transition-all">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-medium">
                    {initials}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
            </button>

            {/* Dropdown Menu for Admin */}
            {dropdownOpen && (
              <div className="absolute right-0 top-14 w-72 bg-white rounded-xl shadow-2xl border border-purple-100 overflow-hidden z-50">
                <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold">
                          <Shield size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {user.displayName || "Admin"}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-600 rounded-full">
                        System Administrator
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <DropdownItem 
                    label="My Profile" 
                    icon={User}
                    onClick={() => {
                      navigate("/admin-dashboard/profile");
                      setDropdownOpen(false);
                    }} 
                  />
                  <DropdownItem 
                    label="Platform Statistics" 
                    icon={BarChart3}
                    onClick={() => {
                      navigate("/admin-dashboard/statistics");
                      setDropdownOpen(false);
                    }}
                  />
                  <DropdownItem 
                    label="Manage Users" 
                    icon={Users}
                    onClick={() => {
                      navigate("/admin-dashboard/manage-users");
                      setDropdownOpen(false);
                    }}
                  />
                  <DropdownItem 
                    label="Role Requests" 
                    icon={ClipboardCheck}
                    onClick={() => {
                      navigate("/admin-dashboard/manage-requests");
                      setDropdownOpen(false);
                    }}
                  />
                  <DropdownItem 
                    label="Dashboard" 
                    icon={LayoutDashboard}
                    onClick={() => {
                      navigate("/admin-dashboard");
                      setDropdownOpen(false);
                    }} 
                  />
                </div>

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
          </div>
        </>
      );
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* ---------- Logo ---------- */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DF603A] to-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
              <ChefHat className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold playfair-font tracking-tight text-gray-900">
                Local Chef<span className="text-[#DF603A]"> Bazaar</span>
              </span>
              <p className="text-xs text-gray-500 -mt-1">Fresh home-cooked meals</p>
            </div>
          </Link>

          {/* ---------- Desktop Content ---------- */}
          <div className="flex  gap-3">
            {renderNavbarContent()}
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
        <MobileMenu 
          isOpen={mobileOpen}
          user={user}
          role={role}
          cartCount={cartCount}
          isActive={isActive}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
          navigate={navigate}
        />
      </div>
    </nav>
  );
};

export default Navbar;

/* ---------- Mobile Menu Component ---------- */
const MobileMenu = ({ isOpen, user, role, cartCount, isActive, onClose, onLogout, navigate }) => {
  if (!isOpen) return null;

  const initials = user?.displayName?.slice(0, 2).toUpperCase() || 
                   user?.email?.slice(0, 2).toUpperCase();

  return (
    <div className="md:hidden py-4 border-t animate-slideDown">
      {/* User Info for Mobile */}
      {user && (
        <div className="px-4 py-3 mb-3 rounded-xl" style={{
          background: role === 'user' ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' :
                      role === 'chef' ? 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)' :
                      'linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%)'
        }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow">
              {user.photoURL ? (
                <img src={user.photoURL} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{
                  background: role === 'user' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                              role === 'chef' ? 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)' :
                              'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                }}>
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">
                {user.displayName || user.email?.split('@')[0]}
              </p>
              <p className="text-sm text-gray-500 capitalize">
                {role === 'user' ? 'Customer' : 
                 role === 'chef' ? 'Verified Chef' : 
                 'Super Admin'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Common Mobile Links */}
      <div className="space-y-1">
        <MobileLink 
          to="/" 
          icon={Home} 
          label="Home" 
          isActive={isActive("/")} 
          onClick={onClose}
        />
        <MobileLink 
          to="/meals" 
          icon={Utensils} 
          label="Meals" 
          isActive={isActive("/meals")} 
          onClick={onClose}
        />
        
        {/* Cart link for users */}
        {user && role === 'user' && (
          <MobileLink 
            to="/cart" 
            icon={ShoppingCart} 
            label="Cart" 
            isActive={isActive("/cart")} 
            onClick={onClose}
            badge={cartCount > 0 ? cartCount : null}
          />
        )}
      </div>

      {/* Auth / User Actions */}
      <div className="mt-4 pt-4 border-t space-y-2">
        {!user ? (
          <>
            <MobileAuthButton 
              to="/auth" 
              label="Login" 
              onClick={onClose}
              variant="secondary"
            />
            <MobileAuthButton 
              to="/auth" 
              label="Sign Up" 
              onClick={onClose}
              variant="primary"
            />
          </>
        ) : (
          <>
            {/* Profile Link */}
            <MobileLink 
              to="/dashboard/profile" 
              icon={User} 
              label="My Profile" 
              onClick={onClose}
            />
            
            {/* Role Specific Mobile Links */}
            {role === 'user' && (
              <>
                <MobileLink 
                  to="/dashboard/orders" 
                  icon={ShoppingCart} 
                  label="My Orders" 
                  onClick={onClose}
                  badge={cartCount > 0 ? cartCount : null}
                />
                <MobileLink 
                  to="/dashboard/reviews" 
                  icon={Star} 
                  label="My Reviews" 
                  onClick={onClose}
                />
                <MobileLink 
                  to="/dashboard/favorites" 
                  icon={Heart} 
                  label="Favorite Meals" 
                  onClick={onClose}
                />
                <MobileLink 
                  to="/dashboard" 
                  icon={LayoutDashboard} 
                  label="Dashboard" 
                  onClick={onClose}
                />
              </>
            )}

            {role === 'chef' && (
              <>
                <MobileLink 
                  to="/chef-dashboard/create-meal" 
                  icon={Utensils} 
                  label="Create Meal" 
                  onClick={onClose}
                />
                <MobileLink 
                  to="/chef-dashboard/my-meals" 
                  icon={Package} 
                  label="My Meals" 
                  onClick={onClose}
                  badge="12"
                />
                <MobileLink 
                  to="/chef-dashboard/order-requests" 
                  icon={ClipboardCheck} 
                  label="Order Requests" 
                  onClick={onClose}
                  badge="5"
                />
                <MobileLink 
                  to="/chef-dashboard" 
                  icon={LayoutDashboard} 
                  label="Dashboard" 
                  onClick={onClose}
                />
              </>
            )}

            {role === 'admin' && (
              <>
                <MobileLink 
                  to="/admin-dashboard/statistics" 
                  icon={BarChart3} 
                  label="Statistics" 
                  onClick={onClose}
                  badge="New"
                />
                <MobileLink 
                  to="/admin-dashboard/manage-users" 
                  icon={Users} 
                  label="Manage Users" 
                  onClick={onClose}
                  badge="24"
                />
                <MobileLink 
                  to="/admin-dashboard/manage-requests" 
                  icon={ClipboardCheck} 
                  label="Role Requests" 
                  onClick={onClose}
                  badge="3"
                />
                <MobileLink 
                  to="/admin-dashboard" 
                  icon={LayoutDashboard} 
                  label="Dashboard" 
                  onClick={onClose}
                />
              </>
            )}

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ---------- Helper Components ---------- */
const DropdownItem = ({ label, icon: Icon, onClick, badge }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-gray-600" />
      <span>{label}</span>
    </div>
    {badge && (
      <span className="px-2 py-0.5 text-xs font-medium bg-[#DF603A] text-white rounded-full">
        {badge}
      </span>
    )}
  </button>
);

const MobileLink = ({ to, icon: Icon, label, isActive, onClick, badge }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
      isActive
        ? "bg-[#DF603A] text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
    {badge && (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
        isActive ? 'bg-white/30 text-white' : 'bg-[#DF603A] text-white'
      }`}>
        {badge}
      </span>
    )}
  </Link>
);

const MobileAuthButton = ({ to, label, onClick, variant = "secondary" }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`block px-4 py-3 text-center font-medium rounded-lg transition ${
      variant === "primary"
        ? "text-white bg-gradient-to-r from-[#DF603A] to-orange-500 hover:shadow-lg"
        : "text-gray-700 hover:bg-gray-100"
    }`}
  >
    {label}
  </Link>
);

/* ---------- Animation ---------- */
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }
`;
document.head.appendChild(style);