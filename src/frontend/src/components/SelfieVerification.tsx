import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface SelfieVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

type Step = "preview" | "captured" | "confirming" | "done" | "error";

export function SelfieVerification({
  isOpen,
  onClose,
  onVerified,
}: SelfieVerificationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [step, setStep] = useState<Step>("preview");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start camera when opened
  useEffect(() => {
    if (!isOpen) return;
    setStep("preview");
    setCapturedImage(null);
    setCameraError(null);

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 640 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Camera access denied";
        if (
          msg.includes("Permission") ||
          msg.includes("denied") ||
          msg.includes("NotAllowed")
        ) {
          setCameraError(
            "Camera permission denied. Please allow camera access in your browser settings and try again.",
          );
        } else if (
          msg.includes("NotFound") ||
          msg.includes("DevicesNotFound")
        ) {
          setCameraError("No camera found on this device.");
        } else {
          setCameraError("Could not access camera. Please try again.");
        }
        setStep("error");
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) track.stop();
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror the image (selfie style)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    setStep("captured");
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setStep("preview");
    // Re-start camera
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        setCameraError("Could not restart camera.");
        setStep("error");
      });
  };

  const handleConfirm = () => {
    setStep("confirming");
    setTimeout(() => {
      setStep("done");
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1400);
    }, 2000);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={
          step === "preview" || step === "error" ? handleClose : undefined
        }
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[430px] rounded-t-3xl overflow-hidden"
          style={{
            background: "#12101a",
            boxShadow: "0 -8px 48px rgba(124,58,237,0.25)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="font-display text-xl font-black text-white">
              Verify Profile
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.08)" }}
              data-ocid="selfie.close_button"
            >
              ✕
            </button>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {step === "error" && (
            <div className="px-5 pb-8 text-center">
              <div className="text-5xl mb-4">📷</div>
              <h3 className="text-white font-bold text-lg mb-2">
                Camera Unavailable
              </h3>
              <p className="text-white/50 text-sm mb-6">{cameraError}</p>
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-xl font-bold text-white/70"
                style={{ background: "rgba(255,255,255,0.08)" }}
                data-ocid="selfie.cancel_button"
              >
                Close
              </button>
            </div>
          )}

          {(step === "preview" || step === "captured") && (
            <div className="px-5 pb-6">
              {/* Live video / captured image */}
              <div
                className="relative w-full rounded-2xl overflow-hidden mb-4"
                style={{ aspectRatio: "1/1", background: "#1a1a2e" }}
              >
                {step === "preview" ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                ) : (
                  capturedImage && (
                    <img
                      src={capturedImage}
                      alt="Selfie"
                      className="w-full h-full object-cover"
                    />
                  )
                )}

                {/* Face guide overlay */}
                {step === "preview" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="w-52 h-52 rounded-full"
                      style={{
                        border: "3px dashed rgba(124,58,237,0.7)",
                        boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
                      }}
                    />
                  </div>
                )}

                {step === "preview" && (
                  <p
                    className="absolute bottom-3 left-0 right-0 text-center text-xs font-medium"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    Align your face in the circle
                  </p>
                )}
              </div>

              {step === "preview" ? (
                <button
                  type="button"
                  onClick={handleCapture}
                  className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                    boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
                  }}
                  data-ocid="selfie.primary_button"
                >
                  📸 Take Selfie
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-sm text-white/70"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    data-ocid="selfie.secondary_button"
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white"
                    style={{
                      background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                    }}
                    data-ocid="selfie.confirm_button"
                  >
                    ✓ Confirm
                  </button>
                </div>
              )}
              <p className="text-center text-xs text-white/30 mt-3">
                Your selfie is only used to verify your identity
              </p>
            </div>
          )}

          {step === "confirming" && (
            <div className="px-5 pb-10 text-center">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                }}
              >
                <span className="text-2xl">📷</span>
              </div>
              <p className="text-white font-semibold mb-3">
                Verifying your selfie…
              </p>
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(139,92,246,0.15)" }}
              >
                <motion.div
                  className="h-1.5 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #7C3AED, #EC4899)",
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>
          )}

          {step === "done" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-5 pb-10 text-center"
            >
              <div className="text-5xl mb-3">✅</div>
              <p className="text-white font-bold text-lg mb-1">
                Profile Verified!
              </p>
              <p className="text-white/50 text-sm">
                Your blue checkmark is now live ✓
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
