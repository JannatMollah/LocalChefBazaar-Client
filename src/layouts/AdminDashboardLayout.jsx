import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  User,
  Users,
  ClipboardCheck,
  BarChart3,
  LogOut,
  Menu,
  X,
  Home,
  Shield,
  Settings,
  Bell,
  ChevronDown,
  Search,
  HelpCircle,
  Mail,
  Calendar,
  FileText,
  TrendingUp,
  Package,
  CreditCard,
  Layers,
  Activity,
} from "lucide-react";
import useAuth from "../hooks/useAuth";

const AdminDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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
      section: "Main", 
      items: [
        { path: "/admin-dashboard/profile", icon: User, label: "My Profile", badge: null },
        { path: "/admin-dashboard/statistics", icon: BarChart3, label: "Dashboard", badge: null },
      ]
    },
    { 
      section: "User Management", 
      items: [
        { path: "/admin-dashboard/manage-users", icon: Users, label: "Manage Users", badge: null },
        { path: "/admin-dashboard/manage-requests", icon: ClipboardCheck, label: "Role Requests", badge: null }
      ]
    }
  ];

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            fixed lg:sticky top-0 left-0 h-screen w-72 bg-gradient-to-b from-white to-gray-50
            shadow-xl border-r border-gray-200 flex flex-col z-40
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#DF603A] to-orange-500 flex items-center justify-center shadow-lg">
                  <Shield className="text-white w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-800 text-lg">
                    {user?.displayName || "Admin Panel"}
                  </h2>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-xs text-gray-500">Super Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
            {navItems.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6 px-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  {section.section}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/admin-dashboard"}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-[#DF603A] to-orange-500 text-white shadow-lg"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          item.badge ? 'bg-opacity-20' : ''
                        } ${
                          item.path.includes('/admin-dashboard/profile') ? 'bg-blue-100 text-blue-600 group-hover:text-blue-700' :
                          item.path.includes('/admin-dashboard/statistics') ? 'bg-purple-100 text-purple-600 group-hover:text-purple-700' :
                          item.path.includes('/admin-dashboard/manage') ? 'bg-green-100 text-green-600 group-hover:text-green-700' :
                          item.path.includes('/admin-dashboard/settings') ? 'bg-yellow-100 text-yellow-600 group-hover:text-yellow-700' :
                          'bg-gray-100 text-gray-600 group-hover:text-gray-700'
                        }`}>
                          <item.icon size={18} />
                        </div>
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.path.includes('/admin-dashboard/statistics') ? 'bg-white/30 text-white' :
                          item.path.includes('/admin-dashboard/manage-requests') ? 'bg-red-100 text-red-600' :
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
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all group"
            >
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200">
                <Home size={18} className="text-gray-600" />
              </div>
              <span className="font-medium text-sm">Back to Home</span>
            </button>
            
            <div className="relative mt-2">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-100 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">{user?.displayName || "Admin"}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
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
        <main className="flex-1 min-h-screen overflow-y-auto">
          {/* Sticky Header */}
          <header className={`
            sticky top-0 z-30 transition-all duration-300
            ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}
          `}>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    <Calendar className="inline w-4 h-4 mr-1" />
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
          background: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
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

export default AdminDashboardLayout;