import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useApp } from "../context/AppContext";

const REPORT_REASONS = [
  "Inappropriate content",
  "Harassment or abuse",
  "Fake profile",
  "Spam",
  "Underage user",
  "Other",
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  targetUserId: string;
  targetName: string;
}

export function ReportModal({
  open,
  onClose,
  targetUserId,
  targetName,
}: ReportModalProps) {
  const { reportUser } = useApp();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!reason) return;
    reportUser(targetUserId, reason, details);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setReason("");
      setDetails("");
      onClose();
    }, 1500);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
      setReason("");
      setDetails("");
      setSubmitted(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[360px] rounded-3xl border-0 p-0 overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #1a1030 0%, #0f0820 100%)",
        }}
        data-ocid="report.dialog"
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-display font-bold text-white">
            Report {targetName}
          </DialogTitle>
          <DialogDescription className="text-purple-300 text-sm">
            Help us keep UNIVÈRA safe
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 pb-8 pt-4 text-center"
              data-ocid="report.success_state"
            >
              <div className="text-4xl mb-3">✅</div>
              <p className="text-white font-semibold">Report submitted</p>
              <p className="text-purple-300 text-sm mt-1">
                We'll review it shortly.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 pb-6 space-y-4"
            >
              <RadioGroup
                value={reason}
                onValueChange={setReason}
                className="space-y-2"
                data-ocid="report.radio"
              >
                {REPORT_REASONS.map((r) => (
                  <div
                    key={r}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                    style={{
                      background:
                        reason === r
                          ? "rgba(124,58,237,0.2)"
                          : "rgba(255,255,255,0.04)",
                      border:
                        reason === r
                          ? "1px solid rgba(124,58,237,0.5)"
                          : "1px solid rgba(255,255,255,0.07)",
                    }}
                    onClick={() => setReason(r)}
                    onKeyDown={(e) => e.key === "Enter" && setReason(r)}
                  >
                    <RadioGroupItem
                      value={r}
                      id={r}
                      className="border-purple-400 text-purple-400"
                    />
                    <Label
                      htmlFor={r}
                      className="text-sm text-white cursor-pointer"
                    >
                      {r}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {reason === "Other" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Please describe the issue..."
                    rows={3}
                    className="resize-none text-sm rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(139,92,246,0.3)",
                      color: "white",
                    }}
                    data-ocid="report.textarea"
                  />
                </motion.div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border-white/10 text-muted-foreground"
                  data-ocid="report.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!reason}
                  className="flex-1 rounded-2xl text-white font-bold"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  }}
                  data-ocid="report.submit_button"
                >
                  Submit Report
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
