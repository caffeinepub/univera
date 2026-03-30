import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface ImgWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackAvatar?: string;
  fallbackClassName?: string;
  style?: React.CSSProperties;
  draggable?: boolean;
}

export function ImgWithFallback({
  src,
  alt,
  className = "",
  fallbackAvatar,
  fallbackClassName = "",
  style,
  draggable,
}: ImgWithFallbackProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  return (
    <>
      {status === "loading" && (
        <Skeleton className={`${className} absolute inset-0`} style={style} />
      )}
      {status === "error" ? (
        <div
          className={`flex items-center justify-center text-2xl select-none ${
            fallbackClassName || className
          }`}
          style={{
            background: "linear-gradient(135deg, #7C3AED22, #EC489922)",
            border: "1px solid rgba(139,92,246,0.2)",
            ...style,
          }}
          aria-label={alt}
        >
          {fallbackAvatar ?? "🧑"}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${className} ${status === "loading" ? "opacity-0 absolute inset-0" : "opacity-100"} transition-opacity duration-300`}
          style={style}
          loading="lazy"
          draggable={draggable}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </>
  );
}
