import { motion } from "framer-motion";

const StatCard = ({ title, value, color }) => (
  <motion.div
    whileHover={{
      scale: 1.06,
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      y: -4,
    }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`relative p-6 rounded-2xl text-white shadow-lg bg-gradient-to-br ${color} overflow-hidden`}
  >
    {/* Decorative Glow */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full blur-xl" />
    </div>
    <div className="relative z-10">
      <h3 className="text-base font-semibold tracking-wide mb-2 opacity-90">
        {title}
      </h3>
      <motion.p
        className="text-4xl font-extrabold mt-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {value}
      </motion.p>
    </div>
    {/* Animated Border */}
    <motion.div
      className="absolute inset-0 rounded-2xl border-2 border-white border-opacity-10 pointer-events-none"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  </motion.div>
);

export default StatCard;
