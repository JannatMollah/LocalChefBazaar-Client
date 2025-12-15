import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary">
          LocalChefBazaar
        </Link>

        {/* Menu */}
        <nav className="flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-primary font-medium"
                : "text-gray-600 hover:text-primary"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/meals"
            className={({ isActive }) =>
              isActive
                ? "text-primary font-medium"
                : "text-gray-600 hover:text-primary"
            }
          >
            Meals
          </NavLink>

          {/* Auth buttons (static for now) */}
          <Link
            to="/login"
            className="px-4 py-2 text-sm rounded bg-primary text-white"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
