// components/AdminDashboardSkeleton.jsx
import { motion } from "framer-motion";

const shimmer =
  "bg-gradient-to-r from-gray-200/80 via-gray-100 to-gray-200/80 animate-pulse";

const AdminDashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 via-sky-100 to-indigo-200 p-2 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-6 border-b bg-white/80">
          <div className={`h-10 w-48 md:w-64 rounded-xl ${shimmer}`}></div>
          <div className="flex gap-2">
            <div className={`h-10 w-10 rounded-full ${shimmer}`}></div>
            <div className={`h-10 w-24 md:w-40 rounded-lg ${shimmer}`}></div>
          </div>
        </header>

        {/* Main Content */}
        <section className="px-2 md:px-8 py-8 space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-24 md:h-28 rounded-2xl shadow-md ${shimmer}`}
              ></div>
            ))}
          </div>

          {/* Search/Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className={`h-12 w-full md:w-2/3 rounded-xl ${shimmer}`}></div>
            <div className={`h-12 w-full md:w-1/3 rounded-xl ${shimmer}`}></div>
          </div>

          {/* Table Skeleton (Desktop) */}
          <div className="hidden md:block">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white/70">
              {/* Table Header */}
              <div className="grid grid-cols-6 px-6 py-4 bg-gray-100/70 border-b border-gray-300">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-5 w-24 rounded-md ${shimmer}`}
                  ></div>
                ))}
              </div>

              {/* Table Rows */}
              {[...Array(5)].map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`grid grid-cols-6 gap-4 px-6 py-4 border-b transition-all ${
                    rowIndex % 2 === 0 ? "bg-white/50" : "bg-gray-50/50"
                  }`}
                >
                  {[...Array(6)].map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className={`h-6 w-full rounded-xl ${shimmer}`}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Card Skeleton (Mobile) */}
          <div className="md:hidden space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl shadow-lg bg-white/70 p-4 flex flex-col gap-3"
              >
                <div className={`h-6 w-1/2 rounded ${shimmer}`}></div>
                <div className={`h-4 w-3/4 rounded ${shimmer}`}></div>
                <div className={`h-4 w-1/3 rounded ${shimmer}`}></div>
                <div className="flex gap-2">
                  <div className={`h-8 w-8 rounded-full ${shimmer}`}></div>
                  <div className={`h-8 w-1/2 rounded-lg ${shimmer}`}></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default AdminDashboardSkeleton;
