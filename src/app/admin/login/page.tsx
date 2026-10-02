"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@princetailor.local");
  const [password, setPassword] = useState("prince123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = { error: "Server connection failed. Is your database running?" };
    }
    
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ backgroundColor: '#3E4A46' }}>
      <div className="flex w-full max-w-[800px] bg-white rounded-[8px] overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.2)] min-h-[500px]">
        {/* Left Panel */}
        <div 
          className="hidden md:flex w-1/2 flex-col justify-center items-center p-8 text-white text-center bg-cover bg-center relative"
          style={{ backgroundImage: 'url(https://images.pexels.com/photos/1342609/pexels-photo-1342609.jpeg?auto=compress&cs=tinysrgb&w=600)' }}
        >
          {/* Subtle overlay for text readability if needed */}
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 bg-black/40 p-6 rounded-lg backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-3 shadow-sm">Discover Your Style</h2>
            <p className="text-sm leading-relaxed text-gray-200">
              Explore our latest collections, carefully curated for the trendsetters and style icons.
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 p-8 md:px-12 flex flex-col justify-center items-center">
          <h1 
            className="text-3xl sm:text-4xl mb-2" 
            style={{ fontFamily: "'Brush Script MT', cursive", color: '#3E4A46' }}
          >
            Prince Designer Studio
          </h1>
          <h2 className="text-[1.2em] mb-6 font-semibold" style={{ color: '#3E4A46' }}>
            Welcome to Prince Designer Studio
          </h2>

          <form onSubmit={onSubmit} className="w-full flex flex-col">
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-center">
                {error}
              </div>
            )}
            
            <label className="text-[0.9em] font-semibold mb-[5px]" style={{ color: '#3E4A46' }}>User name or Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Name"
              className="w-full p-[10px] mb-[15px] border border-[#ddd] rounded-[4px] text-[1em] focus:outline-none focus:border-[#3E4A46]"
              required
            />

            <label className="text-[0.9em] font-semibold mb-[5px]" style={{ color: '#3E4A46' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full p-[10px] mb-[5px] border border-[#ddd] rounded-[4px] text-[1em] focus:outline-none focus:border-[#3E4A46]"
              required
            />

            <a href="#" className="self-end text-[0.8em] mb-[20px] hover:underline" style={{ color: '#3E4A46' }}>
              Forgot password?
            </a>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-[10px] text-white rounded-[4px] text-[1em] mb-[20px] transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer border-none"
              style={{ backgroundColor: '#3E4A46' }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-[#888] text-[0.9em] text-center mb-[20px]">or</p>

            <button
              type="button"
              className="w-full p-[10px] bg-white border border-[#ddd] rounded-[4px] text-[1em] transition-colors hover:bg-gray-50 cursor-pointer"
              style={{ color: '#3E4A46' }}
            >
              Sign in with Google
            </button>

            <p className="text-[0.9em] text-center mt-[20px]" style={{ color: '#3E4A46' }}>
              New to Prince Designer Studio? <a href="#" className="font-semibold hover:underline">Create Account</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
