import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import { motion } from "framer-motion";
import "aos/dist/aos.css";
import { FaArrowUp } from "react-icons/fa";

const Home = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: true });
    AOS.refresh();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const howItWorksSteps = [
    {
      icon: "📝",
      title: "Create Account",
      desc: "Sign up to access your dashboard.",
    },
    {
      icon: "📤",
      title: "Upload Files",
      desc: "Drag & drop Excel files in .xlsx or .csv format.",
    },
    {
      icon: "📊",
      title: "View Insights",
      desc: "Instantly generate charts and data visualizations.",
    },
    {
      icon: "📁",
      title: "Manage Files",
      desc: "Rename or delete uploaded data anytime.",
    },
    {
      icon: "📎",
      title: "Share & Export",
      desc: "Download visuals or share them with your team.",
    },
    {
      icon: "⬇️",
      title: "Download Report",
      desc: "Export formatted reports in a click.",
    },
  ];

  const faqs = [
    {
      question: "Is my data safe?",
      answer: "Yes. Your data is encrypted and securely stored.",
    },
    {
      question: "Can I delete my files?",
      answer: "Absolutely. You can manage or delete uploaded files.",
    },
    {
      question: "What file types are supported?",
      answer: "Upload Excel files in .xlsx or .csv format.",
    },
    {
      question: "Can I share my reports?",
      answer: "Yes. Reports can be exported and shared.",
    },
  ];

  const testimonials = [
    {
      name: "Amit Sharma",
      role: "Data Analyst, Mumbai",
      text: "This platform saved hours of manual work. The AI insights are brilliant!",
    },
    {
      name: "Priya Verma",
      role: "Freelancer",
      text: "Uploading and visualizing data has never been easier. Highly recommended!",
    },
    {
      name: "John Dsouza",
      role: "Team Lead, Pune",
      text: "The export options and dashboard are incredibly polished and easy to use.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative"
    >
      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all"
        >
          <FaArrowUp />
        </button>
      )}

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        {/* Hero */}
        <section data-aos="fade-up" className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4 leading-tight tracking-tight">
            Welcome to <span className="text-purple-700">Excel Analytics</span>{" "}
            📊
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
            Upload, visualize, and extract insights from Excel data in seconds.
          </p>
          <div className="mt-10">
            {!token ? (
              <Link
                to="/auth"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-3 rounded-full shadow-lg hover:scale-105 transform transition-all text-lg font-medium"
              >
                Get Started
              </Link>
            ) : (
              <Link
                to={role === "admin" ? "/admin" : "/dashboard"}
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-10 py-3 rounded-full shadow-lg hover:scale-105 transform transition-all text-lg font-medium"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="mt-28 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {[
            {
              title: "📤 Upload Excel Files",
              text: "Quickly upload .xlsx or .csv files and start analyzing.",
            },
            {
              title: "📊 Visual Insights",
              text: "AI-powered charts and reports that help you make decisions.",
            },
            {
              title: "🔐 Secure Storage",
              text: "Your files are encrypted and stored with full privacy.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-2 border border-purple-100"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.text}</p>
            </motion.div>
          ))}
        </section>

        {/* How It Works */}
        <section
          className="mt-32 max-w-6xl mx-auto text-center"
          data-aos="fade-up"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-14">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {howItWorksSteps.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transform transition hover:-translate-y-1 border border-blue-100"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl mb-4 animate-bounce">{item.icon}</div>
                <h3 className="text-xl font-bold text-blue-700 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section
          className="mt-32 max-w-6xl mx-auto text-center px-4"
          data-aos="fade-up"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-16">
            Trusted by Professionals
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                className="relative bg-white/70 backdrop-blur-xl border border-purple-100 rounded-2xl p-6 text-left shadow-xl hover:shadow-2xl transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed italic">
                    “{t.text}”
                  </p>
                </div>

                {/* Avatar and name */}
                <div className="flex items-center mt-6">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm shadow-inner">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-900 font-semibold text-sm">
                      {t.name}
                    </p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="absolute top-4 right-4 text-yellow-400 flex gap-1">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.562-.955L10 0l2.95 5.955 6.562.955-4.756 4.635 1.122 6.545z" />
                      </svg>
                    ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-32 max-w-3xl mx-auto" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-10 text-center">
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md mb-4 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full flex justify-between items-center px-6 py-4 text-lg font-medium text-gray-800 hover:bg-gray-50 focus:outline-none"
                >
                  {faq.question}
                  <span
                    className={`text-3xl text-purple-600 transition-transform duration-300 ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`px-6 text-sm text-gray-600 transition-all duration-500 ${
                    isOpen ? "max-h-40 pb-4" : "max-h-0"
                  } overflow-hidden`}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </section>
        {/* Contact Form */}
        <section
          className="mt-32 max-w-4xl mx-auto px-6"
          data-aos="fade-up"
          id="contact"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-10 text-center">
            Get in Touch
          </h2>
          <form className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <textarea
              rows="5"
              placeholder="Your Message"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            ></textarea>
            <div className="text-center">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full hover:scale-105 transition-transform shadow-md"
              >
                Send Message
              </button>
            </div>
          </form>
        </section>
      </div>
    </motion.div>
  );
};

export default Home;
