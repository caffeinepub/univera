import { useEffect } from "react";
import { useApp } from "../context/AppContext";

export function ScreenshotDetector({
  otherUserName,
}: { otherUserName: string }) {
  const { planType, addNotification } = useApp();

  useEffect(() => {
    if (planType !== "free") return;

    const triggerAlert = () => {
      addNotification({
        type: "like_photo",
        fromName: "UNIVÈRA",
        fromPhoto: "",
        text: `Screenshot attempt detected in your chat with ${otherUserName} 📸`,
        timestamp: "Just now",
      });
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        triggerAlert();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [planType, otherUserName, addNotification]);

  return null;
}
