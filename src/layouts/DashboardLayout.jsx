import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  User,
  ShoppingBag,
  Star,
  Heart,
  LogOut,
  Menu,
  X,
  Home,
  Settings,
  Bell,
  ChevronDown,
  Search,
  HelpCircle,
  Mail,
  Calendar,
  TrendingUp,
  Package,
  CreditCard,
  MapPin,
  Clock,
  Award,
  ShoppingCart,
  ChefHat,
  Utensils,
  ShieldCheck,
  Gift,
} from "lucide-react";
import useAuth from "../hooks/useAuth";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  // Handle scroll for header effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { 
      section: "My Account", 
      items: [
        { path: "/dashboard/profile", icon: User, label: "My Profile", badge: null }
      ]
    },
    { 
      section: "Orders & Activities", 
      items: [
        { path: "/dashboard/orders", icon: ShoppingBag, label: "My Orders", badge: null },
        { path: "/dashboard/reviews", icon: Star, label: "My Reviews", badge: null },
        { path: "/dashboard/favorites", icon: Heart, label: "Favorites", badge: null },
        { path: "/cart", icon: ShoppingCart, label: "Shopping Cart", badge: null },
      ]
    },
    { 
      section: "Food Experience", 
      items: [
        { path: "/dashboard/tracking", icon: MapPin, label: "Order Tracking", badge: null }
      ]
    }
  ];

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          {sidebarOpen ? (
            <X size={20} className="text-gray-700" />
          ) : (
            <Menu size={20} className="text-gray-700" />
          )}
        </button>
      </div>

      <div className="flex relative">
        {/* Fixed Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen w-72 bg-gradient-to-b from-white to-blue-50/50
            shadow-xl border-r border-blue-200 flex flex-col z-40
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <User className="text-white w-7 h-7" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-800 text-lg">
                    {user?.displayName || "Welcome!"}
                  </h2>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-xs text-blue-600 font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent hover:scrollbar-thumb-blue-400">
            {navItems.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6 px-4">
                <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3 px-2">
                  {section.section}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/dashboard"}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-900"
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          item.badge ? 'bg-opacity-20' : ''
                        } ${
                          item.path.includes('/dashboard/profile') ? 'bg-blue-100 text-blue-600 group-hover:text-blue-700' :
                          item.path.includes('/dashboard/orders') ? 'bg-green-100 text-green-600 group-hover:text-green-700' :
                          item.path.includes('/dashboard/reviews') ? 'bg-yellow-100 text-yellow-600 group-hover:text-yellow-700' :
                          item.path.includes('/dashboard/favorites') ? 'bg-pink-100 text-pink-600 group-hover:text-pink-700' :
                          item.path.includes('/dashboard/rewards') ? 'bg-purple-100 text-purple-600 group-hover:text-purple-700' :
                          'bg-gray-100 text-gray-600 group-hover:text-gray-700'
                        }`}>
                          <item.icon size={18} />
                        </div>
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.path.includes('/dashboard/orders') ? 'bg-green-100 text-green-600' :
                          item.path.includes('/dashboard/reviews') ? 'bg-yellow-100 text-yellow-600' :
                          item.path.includes('/dashboard/favorites') ? 'bg-pink-100 text-pink-600' :
                          item.path.includes('/dashboard/rewards') ? 'bg-purple-100 text-purple-600' :
                          item.path.includes('/dashboard/recommended') ? 'bg-white/30 text-white' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-blue-200 p-4 bg-white">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-blue-50 rounded-xl transition-all group mb-2"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                <Home size={18} className="text-blue-600" />
              </div>
              <span className="font-medium text-sm">Back to Home</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center justify-between w-full px-4 py-3 hover:bg-blue-50 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-300 to-indigo-400 overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-700" />
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">{user?.displayName || "User"}</p>
                    <p className="text-xs text-blue-600">{user.email}</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-blue-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-blue-200 py-2 z-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen overflow-y-auto bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
          {/* Sticky Header */}
          <header className={`
            sticky top-0 z-30 transition-all duration-300
            ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-blue-100' : 'bg-transparent'}
          `}>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      <User className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
                      <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content with Smooth Scroll */}
          <div className="px-6 pb-12">
            <div className="max-w-7xl mx-auto">
              <div className="animate-fadeIn">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #93c5fd;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #60a5fa;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;