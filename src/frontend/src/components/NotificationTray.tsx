import { AnimatePresence, motion } from "motion/react";
import type { AppNotification } from "../context/AppContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
}

const iconForType = (type: AppNotification["type"]) => {
  if (type === "like_photo") return "📸";
  if (type === "like_post") return "❤️";
  if (type === "comment_post") return "💬";
  return "✨";
};

export function NotificationTray({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-md"
            data-ocid="notifications.panel"
          >
            <div
              className="glass-dark rounded-b-3xl shadow-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(139,92,246,0.2)",
                borderTop: "none",
                maxHeight: "70vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
                <h2 className="font-display text-lg font-black text-foreground">
                  Notifications
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    onMarkAllRead();
                  }}
                  className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                  data-ocid="notifications.secondary_button"
                >
                  Mark all read
                </button>
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div
                    className="py-12 text-center"
                    data-ocid="notifications.empty_state"
                  >
                    <div className="text-4xl mb-3">🔔</div>
                    <p className="text-muted-foreground text-sm">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/20">
                    {notifications.map((n, i) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`flex items-center gap-3 px-5 py-3.5 relative ${
                          !n.read ? "bg-primary/5" : ""
                        }`}
                        data-ocid={`notifications.item.${i + 1}`}
                      >
                        {!n.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r-full" />
                        )}
                        <div className="relative flex-shrink-0">
                          <img
                            src={n.fromPhoto}
                            alt={n.fromName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 text-sm">
                            {iconForType(n.type)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-snug ${
                              !n.read
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {n.text}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            {n.timestamp}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
