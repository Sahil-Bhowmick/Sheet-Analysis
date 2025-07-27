import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiLogOut, FiUser } from "react-icons/fi";
import {
  HiOutlineChartBar,
  HiOutlineFolderOpen,
  HiOutlineBookmark,
} from "react-icons/hi";
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
    setTimeout(() => {
      navigate("/");
      window.location.reload();
    }, 2000);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navLinkStyles = ({ isActive }) =>
    `flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ease-in-out
   ${
     isActive
       ? "bg-blue-600 text-white shadow-sm"
       : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
   }`;

  const mobileNavStyles = ({ isActive }) =>
    `flex items-center justify-center gap-2 py-3 px-5 rounded-full font-medium border transition-all duration-300 ease-in-out shadow-sm
   ${
     isActive
       ? "bg-blue-600 text-white border-blue-600"
       : "bg-white text-blue-700 border-blue-500 hover:bg-blue-50 hover:text-blue-600"
   }`;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-md border-b border-blue-200/50 backdrop-blur-md bg-opacity-95 px-6 py-4">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <NavLink
          to="/"
          className="text-xl font-bold text-blue-700 flex items-center gap-1"
        >
          📊 Excel Analytics
        </NavLink>

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
        <div className="hidden md:flex space-x-4 text-sm items-center">
          {!token ? (
            <NavLink to="/auth" className={navLinkStyles}>
              <FiUser />
              Login / Register
            </NavLink>
          ) : (
            <>
              <NavLink
                to={role === "admin" ? "/admin" : "/dashboard"}
                className={navLinkStyles}
              >
                <HiOutlineChartBar />
                {role === "admin" ? "Admin Panel" : "Dashboard"}
              </NavLink>

              {role === "user" && (
                <>
                  <NavLink to="/history" className={navLinkStyles}>
                    <HiOutlineFolderOpen />
                    History
                  </NavLink>
                  <NavLink to="/saved" className={navLinkStyles}>
                    <HiOutlineBookmark />
                    Saved Charts
                  </NavLink>
                </>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white bg-red-500 hover:bg-red-600 transition"
              >
                <FiLogOut />
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 flex md:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={toggleMenu}
        ></div>

        {/* Sidebar */}
        <div
          className={`ml-auto h-full w-72 backdrop-blur-lg border-0.5 border-gray-200 rounded-l-3xl shadow-2xl transform transition-transform duration-500 ease-in-out ${
            menuOpen ? "translate-x-0 scale-100" : "translate-x-full scale-95"
          }`}
        >
          {/* Close Button */}
          <div className="flex justify-end p-4">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-200 transition "
              aria-label="Close menu"
            >
              <FiX size={26} />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex flex-col gap-4 px-6 pt-2 text-sm animate-fade-in">
            {!token ? (
              <NavLink
                to="/auth"
                onClick={toggleMenu}
                className={mobileNavStyles}
              >
                <FiUser />
                Login / Register
              </NavLink>
            ) : (
              <>
                <NavLink
                  to={role === "admin" ? "/admin" : "/dashboard"}
                  onClick={toggleMenu}
                  className={mobileNavStyles}
                >
                  <HiOutlineChartBar />
                  {role === "admin" ? "Admin Panel" : "Dashboard"}
                </NavLink>

                {role === "user" && (
                  <>
                    <NavLink
                      to="/history"
                      onClick={toggleMenu}
                      className={mobileNavStyles}
                    >
                      <HiOutlineFolderOpen />
                      History
                    </NavLink>
                    <NavLink
                      to="/saved"
                      onClick={toggleMenu}
                      className={mobileNavStyles}
                    >
                      <HiOutlineBookmark />
                      Saved Charts
                    </NavLink>
                  </>
                )}

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
      </div>
    </nav>
  );
};

export default Navbar;
