import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChefHat,
  Shield,
  LogOut,
  User,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();

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
    await signOut();
    navigate("/");
  };

  const initials = user?.email?.slice(0, 2).toUpperCase();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-[#FBFAF8]/70 backdrop-blur-lg border-b border-gray-400/20"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--nav-accent)" }}
            >
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold playfair-font">
              Local Chef
              <span style={{ color: "var(--nav-accent)" }}> Bazaar</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative text-sm font-medium"
                style={{
                  color: isActive(link.path)
                    ? "var(--nav-accent)"
                    : "var(--nav-muted)",
                }}
              >
                {link.name}
                {isActive(link.path) && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
                    style={{ backgroundColor: "var(--nav-accent)" }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Auth / User */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative group">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white cursor-pointer"
                  style={{ backgroundColor: "var(--nav-accent)" }}
                >
                  {initials || <User size={18} />}
                </div>

                {/* Dropdown */}
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                  <div className="px-4 py-3 border-b text-sm">
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {role || "user"}
                    </p>
                  </div>

                  {role === "admin" && (
                    <button
                      onClick={() => navigate("/admin")}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <Shield size={16} /> Admin Dashboard
                    </button>
                  )}

                  {(role === "chef" || role === "admin") && (
                    <button
                      onClick={() => navigate("/chef")}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <ChefHat size={16} /> Chef Dashboard
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-sm"
                  style={{ color: "var(--nav-muted)" }}
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="px-4 py-2 rounded-md text-sm text-white"
                  style={{ backgroundColor: "var(--nav-accent)" }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  style={{
                    color: isActive(link.path)
                      ? "var(--nav-accent)"
                      : "var(--nav-muted)",
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
                    <Link to="/auth">Get Started</Link>
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
