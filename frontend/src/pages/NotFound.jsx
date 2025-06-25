// pages/NotFound.jsx
import { Link } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";
import { useEffect, useState } from "react";

const NotFound = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 px-4 overflow-hidden">
      <div
        className={`bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl px-6 sm:px-10 py-12 w-full max-w-lg text-center transform transition-all duration-700 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-100 rounded-full opacity-20 animate-pulse"></div>
          <FiAlertTriangle className="relative text-red-500 w-24 h-24 mx-auto animate-bounce" />
        </div>

        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-600 mb-4 animate-gradient">
          404
        </h1>

        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Page Not Found
        </h2>

        <p className="text-gray-600 mb-10 max-w-md mx-auto">
          We couldn't find the page you're looking for. It might have been moved
          or doesn't exist.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="group flex items-center justify-center gap-2 py-3 px-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:-translate-y-1"
          >
            <FiHome className="transition-transform group-hover:rotate-12" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
