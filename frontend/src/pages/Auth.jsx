import { useState } from "react";
import { loginUser, registerUser, loginWithGoogle } from "../services/api";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/firebase";
import { toast } from "react-toastify";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    });
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const res = await loginUser({
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        toast.success("Login successful!");
        navigate(res.data.role === "admin" ? "/admin" : "/dashboard");
      } else {
        if (formData.password !== formData.confirmPassword) {
          return toast.error("Passwords do not match");
        }

        await registerUser(formData);
        toast.success("Registered successfully! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const res = await loginWithGoogle({ idToken });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      toast.success("Google login successful!");
      navigate(res.data.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error("Google sign-in failed");
      console.error("Google login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-300 via-purple-200 to-pink-200 px-4">
      <div className="w-full max-w-md bg-white/40 backdrop-blur-lg border border-white/30 shadow-xl rounded-3xl px-8 py-10 animate-fade-in">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                required
                className="peer w-full px-3 pt-5 pb-2 border border-gray-300 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-transparent"
              />
              <label className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500 bg-white/80 px-1 rounded">
                Full Name
              </label>
            </div>
          )}

          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
              className="peer w-full px-3 pt-5 pb-2 border border-gray-300 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-transparent"
            />
            <label className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500 bg-white/80 px-1 rounded">
              Email Address
            </label>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              className="peer w-full px-3 pt-5 pb-2 border border-gray-300 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-transparent"
            />
            <label className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500 bg-white/80 px-1 rounded">
              Password
            </label>
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-4 cursor-pointer text-gray-600"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          {!isLogin && (
            <>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  required
                  className="peer w-full px-3 pt-5 pb-2 border border-gray-300 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-transparent"
                />
                <label className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500 bg-white/80 px-1 rounded">
                  Confirm Password
                </label>
              </div>

              <div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white/80 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:opacity-95 transition-all duration-300"
          >
            {isLogin ? "Login" : "Register"}
          </button>

          {isLogin && (
            <p
              onClick={() => navigate("/forgot-password")}
              className="text-center text-sm text-blue-600 hover:underline hover:text-blue-700 transition-all duration-200 cursor-pointer font-medium"
            >
              Forgot Password?
            </p>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-gray-300 rounded-xl shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
          >
            <FcGoogle className="text-xl" />
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              Continue with Google
            </span>
          </button>
        </form>

        <p className="text-center text-sm mt-5 text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={toggleMode}
            className="text-blue-600 hover:underline font-medium"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
