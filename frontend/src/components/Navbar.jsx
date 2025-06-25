import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiLogIn,
  FiUserPlus,
  FiHome,
  FiLogOut,
} from "react-icons/fi";
import { toast } from "react-toastify";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    toast.success("Logged out successfully 👋");

    setMenuOpen(false);

    // Refresh page after 2 seconds
    setTimeout(() => {
      navigate("/");
      window.location.reload(); // refresh page
    }, 2000);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-md border-b border-blue-200/50 backdrop-blur-md bg-opacity-95 px-6 py-4">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold text-blue-700 flex items-center gap-1"
        >
          📊 Excel Analytics
        </Link>

        {/* Hamburger Icon */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-800 focus:outline-none"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-sm items-center">
          {!token ? (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium transition"
              >
                <FiLogIn />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium transition"
              >
                <FiUserPlus />
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to={role === "admin" ? "/admin" : "/dashboard"}
                className="flex items-center gap-1 text-blue-600 font-semibold hover:underline"
              >
                <FiHome />
                {role === "admin" ? "Admin Panel" : "Dashboard"}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition"
              >
                <FiLogOut />
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sidebar Drawer (Mobile) */}
      {/* Sidebar Drawer (Mobile) */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white/80 backdrop-blur-lg border-l border-gray-200 rounded-l-3xl shadow-2xl transform transition-all duration-500 ease-in-out z-40 ${
          menuOpen
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95"
        } md:hidden`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Close menu"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 pt-4 text-sm">
          {!token ? (
            <>
              <Link
                to="/login"
                onClick={toggleMenu}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-md hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                <FiLogIn />
                Login
              </Link>
              <Link
                to="/register"
                onClick={toggleMenu}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-white text-blue-700 border border-blue-600 rounded-full shadow-md hover:bg-blue-50 transition-all duration-300"
              >
                <FiUserPlus />
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to={role === "admin" ? "/admin" : "/dashboard"}
                onClick={toggleMenu}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full shadow-md hover:from-purple-700 hover:to-pink-600 transition-all duration-300"
              >
                <FiHome />
                {role === "admin" ? "Admin Panel" : "Dashboard"}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-white text-red-500 border border-red-400 rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-all duration-300"
              >
                <FiLogOut />
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Blurred Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/10 z-30 transition-opacity duration-300 md:hidden"
          onClick={toggleMenu}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
