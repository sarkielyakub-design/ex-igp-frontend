import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, User, Loader2, AlertCircle } from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", {
        username: username.trim(),
        password,
      });
      login(res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url(/ex-igp-bg.jpg)`,
      }}
      role="main"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="text-center px-8 pt-10">
            <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border-4 border-white/80 shadow-lg mb-5">
              <img
                src="/ex-igp-bg.jpg"
                alt="EX IGP Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold text-white">EX-IGP</h1>
            <p className="text-blue-100 mt-2">Volunteer Registration System</p>

            <div className="flex flex-wrap justify-center gap-2 mt-5">
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-200 text-xs font-medium">
                QR Verification
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-medium">
                ID Cards
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-medium">
                Analytics
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8" noValidate>
            {error && (
              <div
                className="mb-5 flex items-start gap-2 bg-red-500/20 border border-red-400/30 text-red-200 p-3 rounded-xl text-sm"
                role="alert"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className="mb-5">
              <label htmlFor="username" className="block text-white text-sm mb-2 font-medium">
                Username
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                />
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-gray-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-white text-sm mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-gray-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-400/50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Signing In...
                </span>
              ) : (
                "Login"
              )}
            </button>

            <div className="text-center mt-6 text-xs text-gray-300">
              ©️ 2026 EX-IGP Volunteer Registration System
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}