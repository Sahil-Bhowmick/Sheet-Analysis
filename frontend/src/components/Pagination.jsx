// components/Pagination.js
import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(currentPage - i) <= 1) {
        pages.push(i);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-wrap justify-center items-center mt-8 gap-3"
    >
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-full text-sm font-medium bg-white shadow hover:bg-indigo-100 text-indigo-700 disabled:opacity-40 transition"
      >
        <FiChevronLeft className="inline text-lg" />
        Prev
      </motion.button>

      {pages.map((page, i, arr) => {
        const showEllipsis = i > 0 && page - arr[i - 1] > 1;

        return (
          <React.Fragment key={page}>
            {showEllipsis && (
              <span className="text-gray-400 text-sm px-1">...</span>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition shadow ${
                page === currentPage
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-indigo-100"
              }`}
            >
              {page}
            </motion.button>
          </React.Fragment>
        );
      })}

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-full text-sm font-medium bg-white shadow hover:bg-indigo-100 text-indigo-700 disabled:opacity-40 transition"
      >
        Next
        <FiChevronRight className="inline text-lg ml-1" />
      </motion.button>
    </motion.div>
  );
};

export default Pagination;
