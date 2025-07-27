import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const Home = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out-cubic",
      once: false,
      mirror: false,
    });
    AOS.refresh();
  }, []);

  const howItWorksSteps = [
    {
      icon: "📝",
      title: "Create Account",
      desc: "Sign up or log in to access your personalized dashboard.",
    },
    {
      icon: "📤",
      title: "Upload Files",
      desc: "Easily upload Excel files in .xlsx or .csv format.",
    },
    {
      icon: "📊",
      title: "View Insights",
      desc: "Generate beautiful visual reports and charts.",
    },
    {
      icon: "📁",
      title: "Manage Files",
      desc: "Organize, rename, or delete uploaded data files.",
    },
    {
      icon: "📎",
      title: "Share & Export",
      desc: "Download or share insights with your team.",
    },
    {
      icon: "⬇️",
      title: "Download Report",
      desc: "Access and download your formatted reports anytime.",
    },
  ];

  const faqs = [
    {
      question: "Is my data safe?",
      answer:
        "Yes. Your data is encrypted and securely stored with industry-standard practices.",
    },
    {
      question: "Can I delete my files?",
      answer:
        "Absolutely. You can manage or delete any uploaded files from your dashboard.",
    },
    {
      question: "What file types are supported?",
      answer: "You can upload Excel files in .xlsx or .csv format.",
    },
    {
      question: "Can I share my reports?",
      answer:
        "Yes. Reports can be exported and shared with your team or clients.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-32 text-center">
        {/* Hero Section */}
        <section data-aos="fade-up">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
            Welcome to <span className="text-purple-700">Excel Analytics</span>{" "}
            📊
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
            A secure and intuitive platform to upload and analyze your Excel
            data with elegant visual insights.
          </p>
          <div className="mt-10 flex justify-center">
            {!token ? (
              <Link
                to="/auth"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-10 py-3 rounded-full shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 text-lg font-semibold"
              >
                Get Started
              </Link>
            ) : (
              <Link
                to={role === "admin" ? "/admin" : "/dashboard"}
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-10 py-3 rounded-full shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 text-lg font-semibold"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="mt-24 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {[
            {
              title: "📤 Upload Excel Files",
              text: "Upload your .xlsx or .csv files quickly and start analyzing instantly.",
            },
            {
              title: "📊 Visual Insights",
              text: "Dynamic, auto-generated charts to help you see trends clearly.",
            },
            {
              title: "🔐 Secure Storage",
              text: "Your files are encrypted and stored safely with top-tier protocols.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-2"
              data-aos="fade-up"
              data-aos-delay={index * 150}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.text}</p>
            </div>
          ))}
        </section>

        {/* How It Works */}
        <section className="mt-28 max-w-6xl mx-auto" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            {howItWorksSteps.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-2xl transform transition-all hover:-translate-y-1"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-blue-700 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-28 max-w-3xl mx-auto" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-md mb-4 transition-all duration-300 hover:shadow-lg overflow-hidden`}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full flex justify-between items-center px-6 py-4 text-lg font-semibold text-gray-800 focus:outline-none"
                >
                  {faq.question}
                  <span
                    className={`text-3xl text-blue-500 transform transition-transform duration-300 ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`px-6 transition-all duration-500 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-40 pb-4" : "max-h-0"
                  }`}
                >
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default Home;
