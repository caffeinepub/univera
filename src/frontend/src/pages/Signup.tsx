import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Images,
  Loader2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import { useUploadPhoto } from "../hooks/useUploadPhoto";

const PROMPTS = [
  "My perfect weekend is\u2026",
  "Two truths and a lie\u2026",
  "I'll fall for you if\u2026",
  "My biggest green flag is\u2026",
  "Unpopular opinion\u2026",
];

const OTP_SLOTS = [0, 1, 2, 3, 4, 5] as const;

function OTPInput({
  value,
  onChange,
  prefix,
}: {
  value: string;
  onChange: (v: string) => void;
  prefix: string;
}) {
  const padded = value.padEnd(6, " ").slice(0, 6);

  const handleChange = (idx: number, char: string) => {
    if (!/^[0-9]?$/.test(char)) return;
    const arr = padded.split("");
    arr[idx] = char || " ";
    onChange(arr.join(""));
    if (char && idx < 5) {
      const next = document.getElementById(`${prefix}-${idx + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      const arr = padded.split("");
      if (arr[idx].trim() === "" && idx > 0) {
        const prev = document.getElementById(`${prefix}-${idx - 1}`);
        if (prev) (prev as HTMLInputElement).focus();
      } else {
        arr[idx] = " ";
        onChange(arr.join(""));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted.padEnd(6, " ").slice(0, 6));
    e.preventDefault();
    const idx = Math.min(pasted.length, 5);
    setTimeout(() => {
      const el = document.getElementById(`${prefix}-${idx}`);
      if (el) (el as HTMLInputElement).focus();
    }, 50);
  };

  return (
    <div className="flex gap-2 justify-center">
      {OTP_SLOTS.map((i) => {
        const d = padded[i]?.trim() ?? "";
        return (
          <input
            key={`${prefix}-slot-${i}`}
            id={`${prefix}-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all"
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

function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const score =
    (len >= 6 ? 1 : 0) +
    (len >= 10 ? 1 : 0) +
    (hasSpecial ? 1 : 0) +
    (hasUpper ? 1 : 0);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#10b981", "#7c3aed"];
  if (!password) return null;
  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="flex gap-1 flex-1">
        {([1, 2, 3, 4] as const).map((s) => (
          <div
            key={s}
            className="h-1 flex-1 rounded-full transition-all"
            style={{
              background: score >= s ? colors[score] : "rgba(139,92,246,0.15)",
            }}
          />
        ))}
      </div>
      <span className="text-xs font-medium" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
}

function OTPStep({
  title,
  subtitle,
  simOTP,
  otpValue,
  setOtpValue,
  onVerify,
  onResend,
  cooldown,
  error,
  prefix,
  verifying,
}: {
  title: string;
  subtitle: string;
  simOTP?: string;
  otpValue: string;
  setOtpValue: (v: string) => void;
  onVerify: () => void;
  onResend: () => void;
  cooldown: number;
  error: string;
  prefix: string;
  verifying?: boolean;
}) {
  return (
    <div>
      <h2
        className="text-xl font-bold mb-1"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          color: "#4c1d95",
        }}
      >
        {title}
      </h2>
      <p className="text-xs mb-5 opacity-70" style={{ color: "#7c3aed" }}>
        {subtitle}
      </p>
      {error && (
        <div
          className="mb-4 px-3 py-2 rounded-xl text-xs"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#dc2626",
          }}
          data-ocid="signup.error_state"
        >
          {error}
        </div>
      )}
      {simOTP && (
        <div
          className="mb-5 px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          \ud83d\udce9 Your OTP (for testing):{" "}
          <strong style={{ color: "#7c3aed", letterSpacing: "0.12em" }}>
            {simOTP}
          </strong>
        </div>
      )}
      <OTPInput value={otpValue} onChange={setOtpValue} prefix={prefix} />
      <button
        type="button"
        onClick={onVerify}
        disabled={verifying}
        data-ocid="signup.primary_button"
        className="w-full mt-4 py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg, #7C3AED, #EC4899)",
          opacity: verifying ? 0.7 : 1,
        }}
      >
        {verifying && <Loader2 size={14} className="animate-spin" />}
        Verify OTP
      </button>
      <button
        type="button"
        onClick={onResend}
        disabled={cooldown > 0}
        data-ocid="signup.secondary_button"
        className="w-full mt-2 py-2 rounded-xl text-xs transition-opacity"
        style={{ color: "#7c3aed", opacity: cooldown > 0 ? 0.5 : 1 }}
      >
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
      </button>
    </div>
  );
}

type MainStep = 1 | 2 | 3 | 4;
type ProfileSubStep = "a" | "b";

const STEP_LABELS = ["Email", "Phone", "Password", "Profile"];
const GENDER_OPTIONS = [
  { value: "male" as const, label: "Male" },
  { value: "female" as const, label: "Female" },
  { value: "prefer_not_to_say" as const, label: "Prefer not to say" },
];
const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const MAJOR_OPTIONS = [
  "Computer Science",
  "Business",
  "Engineering",
  "Design",
  "Law",
  "Medicine",
  "Arts",
];
const inputStyle = {
  background: "rgba(139,92,246,0.08)",
  border: "1px solid rgba(139,92,246,0.25)",
  color: "#3b0764",
};

export function Signup() {
  const { setUser, updateUserPhotos } = useApp();
  const { actor } = useActor();
  const { uploadFile } = useUploadPhoto();
  const navigate = useNavigate();

  const [step, setStep] = useState<MainStep>(1);
  const [profileSub, setProfileSub] = useState<ProfileSubStep>("a");

  // Step 1 — Email OTP
  const [email, setEmail] = useState("");
  const [emailOTPInput, setEmailOTPInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailSimOTP, setEmailSimOTP] = useState("");
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailError, setEmailError] = useState("");
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const emailCooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 2 — Phone OTP
  const [phone, setPhone] = useState("");
  const [phoneOTPInput, setPhoneOTPInput] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [phoneOTP, setPhoneOTP] = useState("");
  const phoneCooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 3 — Password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passError, setPassError] = useState("");

  // Step 4 — Profile
  const [name, setName] = useState("");
  const [gender, setGender] = useState<
    "male" | "female" | "prefer_not_to_say" | ""
  >("");
  const [age, setAge] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [photos, setPhotos] = useState<{ url: string; caption: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [profileAError, setProfileAError] = useState("");
  const [profileBError, setProfileBError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement | null>(null);

  const startCooldown = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    ref: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  ) => {
    setter(30);
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(() => {
      setter((p) => {
        if (p <= 1) {
          if (ref.current) clearInterval(ref.current);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (emailCooldownRef.current) clearInterval(emailCooldownRef.current);
      if (phoneCooldownRef.current) clearInterval(phoneCooldownRef.current);
    };
  }, []);

  const handleSendEmailOTP = async () => {
    setEmailError("");
    if (!email.toLowerCase().endsWith("@dgu.ac.in")) {
      setEmailError("Only DBS Global University students can sign up");
      return;
    }
    const stored: { email: string }[] = JSON.parse(
      localStorage.getItem("univera_accounts") || "[]",
    );
    if (stored.find((a) => a.email.toLowerCase() === email.toLowerCase())) {
      setEmailError("An account with this email already exists.");
      return;
    }
    setSendingOTP(true);
    try {
      if (!actor) {
        setEmailError("Service unavailable. Please try again.");
        setSendingOTP(false);
        return;
      }
      const result = await (actor as any).requestEmailOTP(email);
      if (result.__kind__ === "ok") {
        setEmailSent(true);
        if (result.ok) setEmailSimOTP(String(result.ok));
        startCooldown(setEmailCooldown, emailCooldownRef);
      } else {
        setEmailError(result.error || "Failed to send OTP. Please try again.");
      }
    } catch {
      setEmailError("Failed to send OTP. Please try again.");
    } finally {
      setSendingOTP(false);
    }
  };

  const handleResendEmailOTP = async () => {
    if (emailCooldown > 0) return;
    startCooldown(setEmailCooldown, emailCooldownRef);
    try {
      if (actor) {
        const res = await (actor as any).requestEmailOTP(email);
        if (res?.__kind__ === "ok" && res.ok) setEmailSimOTP(String(res.ok));
      }
    } catch {
      // fire-and-forget, ignore errors silently
    }
  };

  const handleVerifyEmailOTP = async () => {
    setEmailError("");
    setVerifyingOTP(true);
    try {
      const result = await (actor as any).verifyEmailOTP(
        email,
        emailOTPInput.trim(),
      );
      if (result.__kind__ === "ok") {
        setStep(2);
      } else if (result.__kind__ === "invalid") {
        setEmailError("Incorrect OTP. Please try again.");
      } else if (result.__kind__ === "expired") {
        setEmailError("OTP has expired. Please request a new one.");
      } else if (result.__kind__ === "tooManyAttempts") {
        setEmailError("Too many attempts. Please request a new OTP.");
      }
    } catch {
      setEmailError("Failed to verify OTP. Please try again.");
    } finally {
      setVerifyingOTP(false);
    }
  };

  const generateLocalOTP = (): string =>
    String(Math.floor(100000 + Math.random() * 900000));

  const handleSendPhoneOTP = () => {
    setPhoneError("");
    if (phone.replace(/\D/g, "").length < 10) {
      setPhoneError("Please enter a valid 10-digit phone number.");
      return;
    }
    const otp = generateLocalOTP();
    setPhoneOTP(otp);
    setPhoneSent(true);
    startCooldown(setPhoneCooldown, phoneCooldownRef);
  };

  const handleResendPhoneOTP = () => {
    if (phoneCooldown > 0) return;
    setPhoneOTP(generateLocalOTP());
    startCooldown(setPhoneCooldown, phoneCooldownRef);
  };

  const handleVerifyPhoneOTP = () => {
    setPhoneError("");
    if (phoneOTPInput.trim() !== phoneOTP) {
      setPhoneError("Incorrect OTP. Please try again.");
      return;
    }
    setStep(3);
  };

  const handleContinuePassword = () => {
    setPassError("");
    if (password.length < 6) {
      setPassError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setPassError("Passwords don't match.");
      return;
    }
    setStep(4);
  };

  const handleContinueProfileA = () => {
    setProfileAError("");
    if (!name.trim() || !gender || !age || !major || !year) {
      setProfileAError("Please fill in all fields.");
      return;
    }
    const ageNum = Number.parseInt(age);
    if (ageNum < 17 || ageNum > 35) {
      setProfileAError("Age must be between 17 and 35.");
      return;
    }
    setProfileSub("b");
  };

  // ─── Bulk photo selection ──────────────────────────────────────────────────
  const handleBulkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const capped = files.slice(0, 6);
    setSelectedFiles(capped);
    // Generate preview object URLs
    const previews = capped.map((file) => ({
      url: URL.createObjectURL(file),
      caption: "",
    }));
    setPhotos(previews);
    e.target.value = "";
  };

  const handleRemoveSelectedPhoto = (idx: number) => {
    if (photos.length <= 3) return; // min 3
    URL.revokeObjectURL(photos[idx]?.url ?? "");
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCaptionChange = (idx: number, caption: string) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], caption: caption.slice(0, 80) };
      return next;
    });
  };

  const readyCount = photos.filter((p) => p.url).length;

  const handleCompleteSignup = useCallback(async () => {
    setProfileBError("");
    if (readyCount < 3) {
      setProfileBError("Please select at least 3 photos.");
      return;
    }

    setUploadProgress({ current: 0, total: readyCount });

    // Upload each photo (compress → blob storage → URL)
    const uploadedPhotos: { url: string; caption: string }[] = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      if (!photo.url) continue;
      try {
        let url = photo.url;
        const file = selectedFiles[i];
        if (file) {
          url = await uploadFile(file);
        }
        uploadedPhotos.push({ url, caption: photo.caption });
      } catch {
        // Fall back to preview URL on upload error
        uploadedPhotos.push({ url: photo.url, caption: photo.caption });
      }
      setUploadProgress({ current: i + 1, total: photos.length });
    }

    setUploadProgress(null);

    const account = {
      email,
      phone: `+91${phone}`,
      passwordHash: btoa(password),
      name,
      gender,
      age: Number.parseInt(age),
      major,
      year,
      photos: uploadedPhotos,
      isVerified: false,
      interests: [],
      bio: "",
    };
    const stored: object[] = JSON.parse(
      localStorage.getItem("univera_accounts") || "[]",
    );
    stored.push(account);
    localStorage.setItem("univera_accounts", JSON.stringify(stored));

    setUser({
      name,
      email,
      age: Number.parseInt(age),
      major,
      year,
      mode: "dating",
      isPro: false,
      bio: "",
      interests: [],
      photoUrl: uploadedPhotos[0]?.url || undefined,
      gender: gender as "male" | "female" | "prefer_not_to_say",
      photos: uploadedPhotos,
      coverPhotoIndex: 0,
      isVerified: false,
    });

    // Persist to backend if actor is available
    try {
      await updateUserPhotos(uploadedPhotos, 0);
    } catch {
      // Non-critical — photos already in local state
    }

    navigate({ to: "/onboarding" });
  }, [
    readyCount,
    photos,
    selectedFiles,
    uploadFile,
    email,
    phone,
    password,
    name,
    gender,
    age,
    major,
    year,
    setUser,
    updateUserPhotos,
    navigate,
  ]);

  const renderStep = () => {
    if (step === 1) {
      return (
        <motion.div
          key="step1"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.3 }}
        >
          {!emailSent ? (
            <>
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: "#4c1d95",
                }}
              >
                Verify your university email
              </h2>
              <p
                className="text-xs mb-5 opacity-70"
                style={{ color: "#7c3aed" }}
              >
                Only @dgu.ac.in emails are allowed.
              </p>
              {emailError && (
                <div
                  className="mb-3 px-3 py-2 rounded-xl text-xs"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#dc2626",
                  }}
                  data-ocid="signup.error_state"
                >
                  {emailError}
                </div>
              )}
              <input
                type="email"
                placeholder="student@dgu.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !sendingOTP && handleSendEmailOTP()
                }
                data-ocid="signup.input"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-4"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={handleSendEmailOTP}
                disabled={sendingOTP}
                data-ocid="signup.primary_button"
                className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  opacity: sendingOTP ? 0.7 : 1,
                }}
              >
                {sendingOTP && <Loader2 size={14} className="animate-spin" />}
                Send OTP
              </button>
            </>
          ) : (
            <OTPStep
              title="Verify your university email"
              subtitle={`OTP sent to ${email}`}
              simOTP={emailSimOTP}
              otpValue={emailOTPInput}
              setOtpValue={setEmailOTPInput}
              onVerify={handleVerifyEmailOTP}
              onResend={handleResendEmailOTP}
              cooldown={emailCooldown}
              error={emailError}
              prefix="email-otp"
              verifying={verifyingOTP}
            />
          )}
        </motion.div>
      );
    }

    if (step === 2) {
      return (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.3 }}
        >
          {!phoneSent ? (
            <>
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: "#4c1d95",
                }}
              >
                Link your phone number
              </h2>
              <p
                className="text-xs mb-5 opacity-70"
                style={{ color: "#7c3aed" }}
              >
                We'll send an OTP to verify.
              </p>
              {phoneError && (
                <div
                  className="mb-3 px-3 py-2 rounded-xl text-xs"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#dc2626",
                  }}
                >
                  {phoneError}
                </div>
              )}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="px-3 py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: "rgba(139,92,246,0.1)",
                    color: "#7c3aed",
                    border: "1px solid rgba(139,92,246,0.25)",
                  }}
                >
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  data-ocid="signup.input"
                  className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <button
                type="button"
                onClick={handleSendPhoneOTP}
                data-ocid="signup.primary_button"
                className="w-full py-3 rounded-xl font-semibold text-white text-sm"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                }}
              >
                Send OTP
              </button>
            </>
          ) : (
            <OTPStep
              title="Link your phone number"
              subtitle={`OTP sent to +91 ${phone}`}
              simOTP={phoneOTP}
              otpValue={phoneOTPInput}
              setOtpValue={setPhoneOTPInput}
              onVerify={handleVerifyPhoneOTP}
              onResend={handleResendPhoneOTP}
              cooldown={phoneCooldown}
              error={phoneError}
              prefix="phone-otp"
            />
          )}
        </motion.div>
      );
    }

    if (step === 3) {
      return (
        <motion.div
          key="step3"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.3 }}
        >
          <h2
            className="text-xl font-bold mb-1"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: "#4c1d95",
            }}
          >
            Create your password
          </h2>
          <p className="text-xs mb-5 opacity-70" style={{ color: "#7c3aed" }}>
            Minimum 6 characters.
          </p>
          {passError && (
            <div
              className="mb-3 px-3 py-2 rounded-xl text-xs"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#dc2626",
              }}
              data-ocid="signup.error_state"
            >
              {passError}
            </div>
          )}
          <div className="space-y-3 mb-5">
            <div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-ocid="signup.input"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-11"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-ocid="signup.input"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-11"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs" style={{ color: "#ef4444" }}>
                Passwords don't match
              </p>
            )}
            {confirmPassword &&
              password === confirmPassword &&
              password.length >= 6 && (
                <p
                  className="text-xs flex items-center gap-1"
                  style={{ color: "#10b981" }}
                >
                  <CheckCircle2 size={12} /> Passwords match
                </p>
              )}
          </div>
          <button
            type="button"
            onClick={handleContinuePassword}
            data-ocid="signup.primary_button"
            className="w-full py-3 rounded-xl font-semibold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
          >
            Continue
          </button>
        </motion.div>
      );
    }

    if (profileSub === "a") {
      return (
        <motion.div
          key="step4a"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.3 }}
        >
          <h2
            className="text-xl font-bold mb-1"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: "#4c1d95",
            }}
          >
            Your profile
          </h2>
          <p className="text-xs mb-4 opacity-70" style={{ color: "#7c3aed" }}>
            Tell us a little about yourself.
          </p>
          {profileAError && (
            <div
              className="mb-3 px-3 py-2 rounded-xl text-xs"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#dc2626",
              }}
              data-ocid="signup.error_state"
            >
              {profileAError}
            </div>
          )}
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="signup.input"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
            <div>
              <p
                className="text-xs mb-2 font-medium"
                style={{ color: "#7c3aed" }}
              >
                Gender
              </p>
              <div className="flex gap-2 flex-wrap">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGender(g.value)}
                    data-ocid={`signup.${g.value}.toggle`}
                    className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background:
                        gender === g.value
                          ? "linear-gradient(135deg, #7C3AED, #EC4899)"
                          : "rgba(139,92,246,0.08)",
                      color: gender === g.value ? "white" : "#7c3aed",
                      border: `1px solid ${
                        gender === g.value
                          ? "transparent"
                          : "rgba(139,92,246,0.25)"
                      }`,
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              placeholder="Age (17\u201335)"
              min={17}
              max={35}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              data-ocid="signup.input"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              data-ocid="signup.select"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
              style={inputStyle}
            >
              <option value="">Year of study</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              data-ocid="signup.select"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
              style={inputStyle}
            >
              <option value="">Major / Program</option>
              {MAJOR_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleContinueProfileA}
            data-ocid="signup.primary_button"
            className="w-full py-3 rounded-xl font-semibold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
          >
            Continue
          </button>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="step4b"
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -32 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-1">
          <h2
            className="text-xl font-bold"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: "#4c1d95",
            }}
          >
            Add your photos
          </h2>
          <span
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{ background: "rgba(139,92,246,0.12)", color: "#7c3aed" }}
          >
            {readyCount}/6
          </span>
        </div>
        <p className="text-xs mb-3 opacity-70" style={{ color: "#7c3aed" }}>
          Select 3–6 photos, then add captions. Min 3, max 6.
        </p>

        {/* Upload progress indicator */}
        {uploadProgress && (
          <div
            className="mb-3 px-3 py-2.5 rounded-xl flex items-center gap-2"
            style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.25)",
            }}
            data-ocid="signup.loading_state"
          >
            <Loader2
              size={14}
              className="animate-spin"
              style={{ color: "#7c3aed" }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: "#7c3aed" }}
            >
              Uploading {uploadProgress.current}/{uploadProgress.total} photos…
            </span>
          </div>
        )}

        {profileBError && (
          <div
            className="mb-3 px-3 py-2 rounded-xl text-xs"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#dc2626",
            }}
            data-ocid="signup.error_state"
          >
            {profileBError}
          </div>
        )}

        {/* Bulk select trigger */}
        {photos.length === 0 ? (
          <button
            type="button"
            onClick={() => bulkFileInputRef.current?.click()}
            data-ocid="signup.upload_button"
            className="w-full py-8 rounded-2xl flex flex-col items-center justify-center gap-3 mb-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "rgba(139,92,246,0.06)",
              border: "2px dashed rgba(139,92,246,0.3)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(139,92,246,0.12)" }}
            >
              <Images size={24} style={{ color: "#7c3aed" }} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm" style={{ color: "#4c1d95" }}>
                Select 3–6 photos
              </p>
              <p
                className="text-xs opacity-60 mt-0.5"
                style={{ color: "#7c3aed" }}
              >
                Tap to open your gallery
              </p>
            </div>
          </button>
        ) : (
          <>
            {/* Preview grid with captions */}
            <div className="space-y-3 mb-4 max-h-[42vh] overflow-y-auto pr-1">
              {photos.map((photo, idx) => (
                <div
                  key={photo.url || `preview-${idx}`}
                  className="rounded-2xl p-3 flex gap-3 items-start"
                  style={{
                    background: "rgba(139,92,246,0.05)",
                    border: "1px solid rgba(139,92,246,0.15)",
                  }}
                  data-ocid={`signup.item.${idx + 1}`}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden">
                    <img
                      src={photo.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {photos.length > 3 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedPhoto(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.55)" }}
                        data-ocid={`signup.delete_button.${idx + 1}`}
                      >
                        <X size={10} color="white" />
                      </button>
                    )}
                    {idx === 0 && (
                      <div
                        className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold py-0.5"
                        style={{
                          background: "rgba(124,58,237,0.8)",
                          color: "white",
                        }}
                      >
                        Cover
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  <div className="flex-1">
                    <select
                      className="w-full text-xs px-2 py-1.5 rounded-lg outline-none mb-1.5 appearance-none"
                      style={{ ...inputStyle, fontSize: "11px" }}
                      onChange={(e) => {
                        if (e.target.value)
                          handleCaptionChange(idx, e.target.value);
                      }}
                      defaultValue=""
                    >
                      <option value="">Pick a prompt…</option>
                      {PROMPTS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Or write your caption…"
                      value={photo.caption}
                      onChange={(e) => handleCaptionChange(idx, e.target.value)}
                      className="w-full text-xs px-2 py-1.5 rounded-lg outline-none"
                      style={{ ...inputStyle, fontSize: "11px" }}
                      data-ocid="signup.input"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add more / change selection */}
            <button
              type="button"
              onClick={() => bulkFileInputRef.current?.click()}
              className="w-full py-2 rounded-xl text-xs font-semibold mb-3 flex items-center justify-center gap-1.5"
              style={{
                background: "rgba(139,92,246,0.08)",
                color: "#7c3aed",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
              data-ocid="signup.secondary_button"
            >
              <Camera size={12} /> Change photos
            </button>
          </>
        )}

        <input
          ref={bulkFileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleBulkFileSelect}
          data-ocid="signup.dropzone"
        />

        <button
          type="button"
          onClick={handleCompleteSignup}
          disabled={readyCount < 3 || !!uploadProgress}
          data-ocid="signup.submit_button"
          className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #7C3AED, #EC4899)",
            opacity: readyCount < 3 || !!uploadProgress ? 0.5 : 1,
          }}
        >
          {uploadProgress ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Uploading {uploadProgress.current}/{uploadProgress.total} photos…
            </>
          ) : readyCount < 3 ? (
            `Select ${3 - readyCount} more photo${
              3 - readyCount !== 1 ? "s" : ""
            }`
          ) : (
            "Complete Signup 🎉"
          )}
        </button>
      </motion.div>
    );
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10"
      style={{
        background:
          "linear-gradient(160deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)",
      }}
    >
      <div
        className="text-3xl font-bold tracking-tight mb-6 text-center"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: "italic",
          background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        UNIV\u00c8RA
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-6">
        {STEP_LABELS.map((label, i) => {
          const s = i + 1;
          const isActive = step === s;
          const isDone = step > s;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: isDone
                      ? "#7c3aed"
                      : isActive
                        ? "linear-gradient(135deg, #7C3AED, #EC4899)"
                        : "rgba(139,92,246,0.12)",
                    color:
                      isDone || isActive ? "white" : "rgba(124,58,237,0.4)",
                  }}
                >
                  {isDone ? "\u2713" : s}
                </div>
                <span
                  className="text-xs mt-1"
                  style={{
                    color: isActive ? "#7c3aed" : "rgba(124,58,237,0.4)",
                    fontSize: "10px",
                  }}
                >
                  {label}
                </span>
              </div>
              {i < 3 && (
                <div
                  className="w-6 h-px mb-4"
                  style={{
                    background: step > s ? "#7c3aed" : "rgba(139,92,246,0.2)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-3xl p-7 shadow-xl"
        style={{
          background: "rgba(245,243,255,0.97)",
          border: "1px solid rgba(139,92,246,0.3)",
          backdropFilter: "blur(20px)",
        }}
      >
        {(step > 1 || profileSub === "b") && (
          <button
            type="button"
            onClick={() => {
              if (profileSub === "b") {
                setProfileSub("a");
              } else {
                setStep((s) => (s - 1) as MainStep);
                if (step === 2) setPhoneSent(false);
              }
            }}
            data-ocid="signup.cancel_button"
            className="flex items-center gap-1 text-xs mb-4 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: "#7c3aed" }}
          >
            <ArrowLeft size={12} /> Back
          </button>
        )}
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      <p
        className="mt-4 text-xs text-center"
        style={{ color: "rgba(109,40,217,0.5)" }}
      >
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          data-ocid="signup.link"
          className="underline hover:opacity-80"
        >
          Sign in
        </button>
      </p>

      <p
        className="mt-4 text-xs text-center"
        style={{ color: "rgba(109,40,217,0.4)" }}
      >
        \u00a9 {new Date().getFullYear()}. Built with love using{" "}
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
