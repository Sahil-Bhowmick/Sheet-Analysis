import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/firebase";
import { toast } from "react-toastify";
import { loginUser, registerUser, loginWithGoogle } from "../services/api";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin((s) => !s);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const setRole = (role) => setFormData((p) => ({ ...p, role }));

  const persistUser = (opts = {}) => {
    if (opts.token)
      localStorage.setItem(
        "token",
        opts.token.startsWith("Bearer ") ? opts.token.split(" ")[1] : opts.token
      );
    if (opts.role) localStorage.setItem("role", opts.role);
    if (opts.name) localStorage.setItem("name", opts.name);
    try {
      window.dispatchEvent(
        new CustomEvent("user:updated", { detail: { name: opts.name } })
      );
    } catch {}
  };

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", pct: 0 };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    const normalized = Math.min(4, Math.floor((score / 5) * 4));
    const map = {
      0: { label: "Very weak", pct: 6 },
      1: { label: "Weak", pct: 30 },
      2: { label: "Fair", pct: 55 },
      3: { label: "Good", pct: 80 },
      4: { label: "Strong", pct: 100 },
    };
    return { score: normalized, ...map[normalized] };
  };

  const pwdStrength = useMemo(
    () => calculatePasswordStrength(formData.password),
    [formData.password]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await loginUser({
          email: formData.email,
          password: formData.password,
        });
        const token = res.data?.token ?? res?.data?.accessToken ?? res?.token;
        const role = (
          res.data?.role ||
          res?.data?.user?.role ||
          "user"
        ).toLowerCase();
        const name =
          res.data?.user?.name ||
          res.data?.name ||
          res.data?.user ||
          res?.data?.email ||
          "";
        if (!token || !role) throw new Error("Invalid login response");
        persistUser({ token, role, name });
        toast.success("Login successful!");
        navigate(role === "admin" ? "/admin" : "/dashboard");
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }
        if (pwdStrength.score < 3) {
          toast.error(
            `Please choose a stronger password — ${pwdStrength.label}.`
          );
          setLoading(false);
          return;
        }
        await registerUser(formData);
        toast.success("Registered successfully! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      localStorage.clear();
      toast.error(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const res = await loginWithGoogle({ idToken });
      const token = res.data?.token ?? res?.data?.accessToken;
      const role = (
        res.data?.role ||
        res?.data?.user?.role ||
        "user"
      ).toLowerCase();
      const name =
        res.data?.user?.name ||
        res.data?.name ||
        user.displayName ||
        user.email ||
        "";
      persistUser({ token, role, name });
      toast.success("Google login successful!");
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } catch {
      localStorage.clear();
      toast.error("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-100 via-purple-50 to-pink-50 p-4">
      <section className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        {/* Left Hero */}
        <div className="hidden md:flex flex-col justify-center p-8 bg-gradient-to-b from-indigo-600 to-violet-600 text-white relative">
          <div className="max-w-xs text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 flex items-center justify-center ring-1 ring-white/20">
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7.5L12 3l9 4.5v9L12 21 3 16.5v-9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Excel Analytics</h3>
            <p className="text-sm text-white/90">
              Fast interactive charts, AI-powered insights, and easy Excel
              integration.
            </p>
            <ul className="text-xs text-white/80 space-y-1 mt-2 text-left">
              {[
                "Visualize data instantly",
                "Generate AI-driven analysis",
                "Export charts as PNG/PDF",
                "3D charts support",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute -right-8 bottom-8 w-36 h-24 rounded-xl bg-white/6 blur-sm rotate-6 pointer-events-none" />
        </div>

        {/* Right Form */}
        <div className="p-6 sm:p-8 flex items-center justify-center">
          <div className="w-full max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {isLogin ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isLogin ? "Sign in to continue" : "Join and start analyzing"}
                </p>
              </div>
              <button
                onClick={toggleMode}
                className="text-xs px-3 py-1 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {!isLogin && (
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Full name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                />
              )}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Email"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Password"
                  className="w-full px-3 pr-10 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-slate-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {!isLogin && (
                <div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        pwdStrength.score >= 3
                          ? "bg-emerald-500"
                          : pwdStrength.score === 2
                          ? "bg-amber-400"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${pwdStrength.pct}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1">{pwdStrength.label}</p>
                </div>
              )}

              {!isLogin && (
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm Password"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                />
              )}

              {!isLogin && (
                <div className="mt-3">
                  <div className="inline-flex gap-2 rounded-lg bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setRole("user")}
                      className={`px-4 py-2 rounded-lg transition ${
                        formData.role === "user"
                          ? "bg-indigo-50 ring-1 ring-indigo-300 shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      User
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("admin")}
                      className={`px-4 py-2 rounded-lg transition ${
                        formData.role === "admin"
                          ? "bg-indigo-50 ring-1 ring-indigo-300 shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Choose who you are — admins have extra privileges.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Sign in"
                  : "Create account"}
              </button>

              {isLogin && (
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Forgot password?
                </button>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <div className="text-xs text-slate-400">or</div>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60"
              >
                <FcGoogle />
                <span>
                  {loading ? "Processing..." : "Continue with Google"}
                </span>
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={toggleMode}
                className="text-indigo-600 font-medium hover:underline"
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
