import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { PROFILES } from "../data/mockData";

type ForgotStep = "email" | "otp" | "newpass" | null;

const OTP_SLOTS = [0, 1, 2, 3, 4, 5] as const;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function OTPBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleChange = (idx: number, char: string) => {
    if (!/^[0-9]?$/.test(char)) return;
    const arr = digits.map((d) => d);
    arr[idx] = char;
    const joined = arr.join("");
    onChange(joined);
    if (char && idx < 5) {
      const next = document.getElementById(`otp-forgot-${idx + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      const prev = document.getElementById(`otp-forgot-${idx - 1}`);
      if (prev) (prev as HTMLInputElement).focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {OTP_SLOTS.map((i) => {
        const d = digits[i] ?? "";
        return (
          <input
            key={`otp-forgot-slot-${i}`}
            id={`otp-forgot-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="w-11 h-13 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all"
            style={{
              background: "rgba(139,92,246,0.08)",
              borderColor: d ? "#8b5cf6" : "rgba(139,92,246,0.25)",
              color: "#5b21b6",
              boxShadow: d ? "0 0 0 3px rgba(139,92,246,0.15)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

export function Landing() {
  const { setUser } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password flow
  const [forgotStep, setForgotStep] = useState<ForgotStep>(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOTP, setForgotOTP] = useState("");
  const [forgotOTPGenerated, setForgotOTPGenerated] = useState("");
  const [forgotOTPInput, setForgotOTPInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleLogin = () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const stored: any[] = JSON.parse(
        localStorage.getItem("univera_accounts") || "[]",
      );
      const found = stored.find(
        (a) =>
          a.email.toLowerCase() === email.toLowerCase() &&
          a.passwordHash === btoa(password),
      );
      setLoading(false);
      if (found) {
        setUser({
          name: found.name,
          email: found.email,
          age: found.age || 20,
          major: found.major || "CS",
          year: found.year || "2nd Year",
          mode: "dating",
          isPro: false,
          bio: found.bio || "",
          interests: found.interests || [],
          photoUrl: found.photos?.[0]?.url || undefined,
          gender: found.gender,
          photos: found.photos,
          isVerified: found.isVerified || false,
        });
        navigate({ to: "/app" });
      } else {
        setError("Incorrect email or password. Please try again.");
      }
    }, 600);
  };

  const handleDemoLogin = () => {
    const demo = PROFILES[0];
    setUser({
      name: demo.name,
      email: "demo@dgu.ac.in",
      age: demo.age,
      major: demo.major,
      year: demo.year,
      mode: "dating",
      isPro: false,
      bio: demo.bio,
      interests: demo.interests,
      photoUrl: demo.photo,
      gender: "female",
      isVerified: true,
    });
    navigate({ to: "/app" });
  };

  const handleForgotSendOTP = () => {
    setForgotError("");
    if (!forgotEmail.endsWith("@dgu.ac.in")) {
      setForgotError("Only DBS Global University students can use this.");
      return;
    }
    const otp = generateOTP();
    setForgotOTPGenerated(otp);
    setForgotOTP(otp);
    setForgotStep("otp");
  };

  const handleForgotVerifyOTP = () => {
    setForgotError("");
    if (forgotOTPInput !== forgotOTPGenerated) {
      setForgotError("Incorrect OTP. Please try again.");
      return;
    }
    setForgotStep("newpass");
  };

  const handleForgotUpdatePassword = () => {
    setForgotError("");
    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setForgotError("Passwords don't match.");
      return;
    }
    const stored: any[] = JSON.parse(
      localStorage.getItem("univera_accounts") || "[]",
    );
    const updated = stored.map((a) =>
      a.email.toLowerCase() === forgotEmail.toLowerCase()
        ? { ...a, passwordHash: btoa(newPassword) }
        : a,
    );
    localStorage.setItem("univera_accounts", JSON.stringify(updated));
    setForgotSuccess("Password updated! Please login with your new password.");
    setTimeout(() => {
      setForgotStep(null);
      setForgotEmail("");
      setForgotOTPInput("");
      setForgotOTPGenerated("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setForgotSuccess("");
    }, 2000);
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10"
      style={{
        background:
          "linear-gradient(160deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)",
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 text-center"
      >
        <div
          className="text-5xl font-bold tracking-tight mb-1"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          UNIVÈRA
        </div>
        <div
          className="text-xs tracking-[0.25em] uppercase font-medium mt-1"
          style={{ color: "#9333ea" }}
        >
          DBS Global University
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="w-full max-w-sm rounded-3xl p-8 shadow-xl"
        style={{
          background: "rgba(245,243,255,0.97)",
          border: "1px solid rgba(139,92,246,0.3)",
          backdropFilter: "blur(20px)",
        }}
      >
        <AnimatePresence mode="wait">
          {forgotStep === null ? (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h1
                className="text-2xl font-bold mb-1"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: "#4c1d95",
                }}
              >
                Welcome back 💜
              </h1>
              <p className="text-sm mb-6" style={{ color: "#7c3aed" }}>
                Your campus is waiting.
              </p>

              {error && (
                <div
                  className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#dc2626",
                  }}
                  data-ocid="login.error_state"
                >
                  {error}
                </div>
              )}

              <div className="space-y-3 mb-5">
                <input
                  type="email"
                  placeholder="University email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  data-ocid="login.input"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(139,92,246,0.08)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    color: "#3b0764",
                  }}
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    data-ocid="login.input"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-11"
                    style={{
                      background: "rgba(139,92,246,0.08)",
                      border: "1px solid rgba(139,92,246,0.25)",
                      color: "#3b0764",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                data-ocid="login.primary_button"
                className="w-full py-3 rounded-xl font-semibold text-white text-sm mb-3 transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                data-ocid="login.secondary_button"
                className="w-full py-3 rounded-xl font-semibold text-sm mb-5 transition-all hover:opacity-80"
                style={{
                  background: "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.25)",
                  color: "#7c3aed",
                }}
              >
                ✨ Try Demo
              </button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setForgotStep("email")}
                  data-ocid="login.link"
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: "#7c3aed" }}
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/signup" })}
                  data-ocid="login.link"
                  className="flex items-center gap-1 font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "#7c3aed" }}
                >
                  New to UNIVÈRA? Sign up <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          ) : forgotStep === "email" ? (
            <motion.div
              key="forgot-email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => {
                  setForgotStep(null);
                  setForgotError("");
                }}
                className="text-xs mb-4 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: "#7c3aed" }}
              >
                ← Back to login
              </button>
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: "#4c1d95",
                }}
              >
                Reset Password
              </h2>
              <p
                className="text-xs mb-5 opacity-70"
                style={{ color: "#7c3aed" }}
              >
                Enter your DGU email to receive an OTP.
              </p>
              {forgotError && (
                <div
                  className="mb-3 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#dc2626",
                  }}
                >
                  {forgotError}
                </div>
              )}
              <input
                type="email"
                placeholder="your@dgu.ac.in"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-4"
                style={{
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.25)",
                  color: "#3b0764",
                }}
              />
              <button
                type="button"
                onClick={handleForgotSendOTP}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                }}
              >
                Send OTP
              </button>
            </motion.div>
          ) : forgotStep === "otp" ? (
            <motion.div
              key="forgot-otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => {
                  setForgotStep("email");
                  setForgotError("");
                }}
                className="text-xs mb-4 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: "#7c3aed" }}
              >
                ← Back
              </button>
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: "#4c1d95",
                }}
              >
                Verify OTP
              </h2>
              <p
                className="text-xs mb-4 opacity-70"
                style={{ color: "#7c3aed" }}
              >
                Enter the OTP sent to {forgotEmail}
              </p>
              {forgotError && (
                <div
                  className="mb-3 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#dc2626",
                  }}
                >
                  {forgotError}
                </div>
              )}
              {/* Simulated OTP */}
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}
              >
                📩 Your OTP (for testing):{" "}
                <strong style={{ color: "#7c3aed" }}>{forgotOTP}</strong>
              </div>
              <OTPBoxes value={forgotOTPInput} onChange={setForgotOTPInput} />
              <button
                type="button"
                onClick={handleForgotVerifyOTP}
                className="w-full mt-4 py-3 rounded-xl font-semibold text-white text-sm"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                }}
              >
                Verify OTP
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="forgot-newpass"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: "#4c1d95",
                }}
              >
                New Password
              </h2>
              <p
                className="text-xs mb-4 opacity-70"
                style={{ color: "#7c3aed" }}
              >
                Create a new password for your account.
              </p>
              {forgotError && (
                <div
                  className="mb-3 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#dc2626",
                  }}
                >
                  {forgotError}
                </div>
              )}
              {forgotSuccess && (
                <div
                  className="mb-3 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    color: "#16a34a",
                  }}
                >
                  {forgotSuccess}
                </div>
              )}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-11"
                    style={{
                      background: "rgba(139,92,246,0.08)",
                      border: "1px solid rgba(139,92,246,0.25)",
                      color: "#3b0764",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: "rgba(139,92,246,0.08)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    color: "#3b0764",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleForgotUpdatePassword}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                }}
              >
                Update Password
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-xs text-center"
        style={{ color: "rgba(109,40,217,0.5)" }}
      >
        <Sparkles size={10} className="inline mr-1" />
        Only for verified DBS Global University students
      </motion.p>

      <p
        className="mt-6 text-xs text-center"
        style={{ color: "rgba(109,40,217,0.4)" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:opacity-80"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
