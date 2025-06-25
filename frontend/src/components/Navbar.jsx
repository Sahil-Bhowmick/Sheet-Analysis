import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
    setMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="sticky top-0 z-50 bg-white backdrop-blur-md bg-opacity-90 shadow-md px-6 py-4">
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
            className="text-gray-700 focus:outline-none"
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
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to={role === "admin" ? "/admin" : "/dashboard"}
                className="text-blue-600 font-semibold hover:underline"
              >
                {role === "admin" ? "Admin Panel" : "Dashboard"}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sidebar Drawer (Mobile) */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white/90 backdrop-blur-md rounded-l-xl shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={toggleMenu}
            className="text-gray-600 hover:text-gray-800"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="flex flex-col gap-3 px-6 text-sm">
          {!token ? (
            <>
              <Link
                to="/login"
                onClick={toggleMenu}
                className="block w-full text-center py-2 px-4 bg-white text-gray-800 rounded-lg shadow-sm hover:bg-blue-100 hover:text-blue-700 font-semibold transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={toggleMenu}
                className="block w-full text-center py-2 px-4 bg-white text-gray-800 rounded-lg shadow-sm hover:bg-blue-100 hover:text-blue-700 font-semibold transition-all duration-200"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to={role === "admin" ? "/admin" : "/dashboard"}
                onClick={toggleMenu}
                className="block w-full text-center py-2 px-4 bg-white text-blue-700 rounded-lg shadow-sm hover:bg-blue-100 hover:text-blue-800 font-semibold transition-all duration-200"
              >
                {role === "admin" ? "Admin Panel" : "Dashboard"}
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-center py-2 px-4 bg-white text-red-500 rounded-lg shadow-sm hover:bg-red-100 hover:text-red-700 font-semibold transition-all duration-200"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Blurred Glass Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/10 z-30 md:hidden"
          onClick={toggleMenu}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
