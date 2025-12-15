import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChefHat,
  Shield,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logOut } = useAuth();

  /* ---------------- outside click close ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------------- nav links ---------------- */
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Meals", path: "/meals" },
  ];

  if (role === "admin") {
    navLinks.push({ name: "Admin", path: "/admin" });
  }

  if (role === "chef" || role === "admin") {
    navLinks.push({ name: "Chef Dashboard", path: "/chef" });
  }

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logOut();
    setDropdownOpen(false);
    navigate("/");
  };


  const initials = user?.displayName
    ? user.displayName.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FBFAF8]/70 backdrop-blur-lg border-b border-gray-400/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">
          {/* ---------------- Logo ---------------- */}
          <Link to="/" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#df603a" }}
            >
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold playfair-font">
              Local Chef
              <span style={{ color: "#df603a" }}> Bazaar</span>
            </span>
          </Link>

          {/* ---------------- Desktop Links ---------------- */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative text-sm font-medium"
                style={{
                  color: isActive(link.path)
                    ? "#df603a"
                    : "#6b7280",
                }}
              >
                {link.name}
                {isActive(link.path) && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
                    style={{ backgroundColor: "#df603a" }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* ---------------- User / Auth ---------------- */}
          <div className="hidden md:flex items-center gap-4 relative" ref={dropdownRef}>
            {!user ? (
              <>
                <Link
                  to="/auth"
                  className="px-4 py-2 rounded-md text-sm text-white"
                  style={{ backgroundColor: "#df603a" }}
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                {/* Avatar */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: "#df603a" }}
                >
                  {initials || <User size={18} />}
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-14 w-64 bg-white rounded-xl shadow-lg border overflow-hidden">
                    <div className="px-4 py-3 border-b text-sm">
                      <p className="font-medium">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs mt-1 capitalize text-[#df603a]">
                        {role || "user"}
                      </p>
                    </div>

                    {/* USER */}
                    <DropdownItem
                      label="My Profile"
                      onClick={() => navigate("/dashboard/profile")}
                    />
                    <DropdownItem
                      label="My Orders"
                      onClick={() => navigate("/dashboard/orders")}
                    />
                    <DropdownItem
                      label="My Reviews"
                      onClick={() => navigate("/dashboard/reviews")}
                    />
                    <DropdownItem
                      label="Favorite Meals"
                      onClick={() => navigate("/dashboard/favorites")}
                    />

                    {/* CHEF */}
                    {role === "chef" && (
                      <>
                        <Divider />
                        <DropdownItem
                          label="Create Meal"
                          onClick={() => navigate("/chef/create-meal")}
                        />
                        <DropdownItem
                          label="My Meals"
                          onClick={() => navigate("/chef/meals")}
                        />
                        <DropdownItem
                          label="Order Requests"
                          onClick={() => navigate("/chef/requests")}
                        />
                      </>
                    )}

                    {/* ADMIN */}
                    {role === "admin" && (
                      <>
                        <Divider />
                        <DropdownItem
                          label="Manage Users"
                          onClick={() => navigate("/admin/users")}
                        />
                        <DropdownItem
                          label="Manage Requests"
                          onClick={() => navigate("/admin/requests")}
                        />
                      </>
                    )}

                    <Divider />

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ---------------- Mobile Toggle ---------------- */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* ---------------- Mobile Menu ---------------- */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    color: isActive(link.path)
                      ? "#df603a"
                      : "#6b7280",
                  }}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 border-t">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600"
                  >
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link to="/auth">Login</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

/* ---------- helpers ---------- */

const DropdownItem = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
  >
    <LayoutDashboard size={16} />
    {label}
  </button>
);

const Divider = () => <div className="h-px bg-gray-200 my-1" />;
