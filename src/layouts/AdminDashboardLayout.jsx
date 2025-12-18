import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
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
} from "lucide-react";
import useAuth from "../hooks/useAuth";

const AdminDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: "/admin-dashboard/profile", icon: User, label: "My Profile" },
    { path: "/admin-dashboard/manage-users", icon: Users, label: "Manage Users" },
    { path: "/admin-dashboard/manage-requests", icon: ClipboardCheck, label: "Manage Requests" },
    { path: "/admin-dashboard/statistics", icon: BarChart3, label: "Platform Statistics" },
  ];

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FBFAF8]">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static top-0 left-0 h-screen w-64 bg-white shadow-xl
            transform transition-transform duration-300 z-40
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#DF603A] flex items-center justify-center">
                <Shield className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">
                  {user?.displayName || "Admin"}
                </h2>
                <p className="text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin-dashboard"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive
                      ? "bg-[#DF603A] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              <Home size={20} />
              <span>Back to Home</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition mt-2"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;