import { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const Home = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false, // animate every scroll
      mirror: true, // animate on scroll up as well
    });
    AOS.refresh(); // recalculate animations if needed
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-32 text-center">
        {/* Hero Section */}
        <div data-aos="fade-up" data-aos-anchor-placement="top-bottom">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            Welcome to Excel Analytics 📊
          </h1>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            A secure and intuitive platform to upload and analyze your Excel
            data with visual insights.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md shadow transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <Link
                to={role === "admin" ? "/admin" : "/dashboard"}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md shadow transition"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 text-left">
          {[
            {
              title: "📤 Upload Excel Files",
              text: "Effortlessly upload .xlsx or .csv files and get started right away.",
            },
            {
              title: "📊 Instant Visualization",
              text: "Get real-time visual charts and tables for your data analysis.",
            },
            {
              title: "🔐 Safe & Secure",
              text: "Your data is handled with care using modern security best practices.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-transform duration-300 transform hover:-translate-y-2"
              data-aos="fade-up"
              data-aos-delay={i * 150}
              data-aos-anchor-placement="top-bottom"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.text}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div
          className="mt-24 max-w-3xl mx-auto text-left"
          data-aos="fade-up"
          data-aos-anchor-placement="top-bottom"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            How It Works
          </h2>
          <ol className="list-decimal pl-5 text-gray-700 space-y-2">
            <li>Sign up or log in to your account.</li>
            <li>Access the dashboard to upload Excel files.</li>
            <li>View auto-generated visual reports.</li>
            <li>Download or share insights with your team.</li>
          </ol>
        </div>

        {/* FAQ Section */}
        <div
          className="mt-24 max-w-3xl mx-auto"
          data-aos="fade-up"
          data-aos-anchor-placement="top-bottom"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">FAQs</h2>
          <details className="bg-white p-4 rounded shadow mb-2 transition duration-300 ease-in-out hover:scale-[1.01]">
            <summary className="font-semibold cursor-pointer">
              Is my data safe?
            </summary>
            <p className="mt-2 text-gray-600">
              Yes, your uploaded files are stored securely and never shared.
            </p>
          </details>
          <details className="bg-white p-4 rounded shadow mb-2 transition duration-300 ease-in-out hover:scale-[1.01]">
            <summary className="font-semibold cursor-pointer">
              Can I delete my files?
            </summary>
            <p className="mt-2 text-gray-600">
              Yes, you can manage or remove uploaded files anytime from the
              dashboard.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Home;
