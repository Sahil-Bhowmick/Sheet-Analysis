import { useState } from "react";
import { toast } from "react-toastify";
import { sendForgotPasswordLink } from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await sendForgotPasswordLink(email);
      setMessage(data.message);
      toast.success("Reset link sent!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-300 via-purple-200 to-pink-200 px-4">
      <div className="w-full max-w-md bg-white/40 backdrop-blur-lg border border-white/30 shadow-xl rounded-3xl px-8 py-10 animate-fade-in">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Forgot Password?
        </h2>
        <p className="text-sm text-center text-gray-600 mb-6">
          Enter your registered email to receive a reset link.
        </p>

        <form onSubmit={handleForgotPassword} className="space-y-5">
          <div className="relative">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="peer w-full px-3 pt-5 pb-2 border border-gray-300 rounded-lg bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-transparent"
            />
            <label className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500 bg-white/80 px-1 rounded">
              Email Address
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:opacity-95 transition-all duration-300"
          >
            Send Reset Link
          </button>
        </form>

        {message && (
          <p className="text-center text-sm mt-5 text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
