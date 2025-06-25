import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaGithub,
  FaArrowUp,
} from "react-icons/fa";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <footer className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-gray-700 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            {/* Branding */}
            <div className="mb-4 md:mb-0 font-semibold text-gray-800 text-center md:text-left">
              © {new Date().getFullYear()} Excel Analytics. All rights reserved.
            </div>

            {/* Social Icons */}
            <div className="flex space-x-6 text-xl">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-[#1877F2] transition transform hover:scale-110"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="hover:text-[#1DA1F2] transition transform hover:scale-110"
              >
                <FaTwitter />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-[#0077B5] transition transform hover:scale-110"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="hover:text-black transition transform hover:scale-110"
              >
                <FaGithub />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-5 right-5 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 transition transform hover:scale-105"
        aria-label="Scroll to top"
      >
        <FaArrowUp />
      </button>
    </>
  );
};

export default Footer;
