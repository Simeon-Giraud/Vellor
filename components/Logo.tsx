import React from "react";
import Image from "next/image";

export function Logo({ 
  className = "w-8 h-8",
  invert,
}: { 
  className?: string;
  invert?: boolean;
}) {
  const filter = invert === true ? "invert(1)" : invert === false ? "none" : "var(--logo-filter)";
  const mixBlendMode = invert === true ? "screen" : invert === false ? "normal" : "var(--logo-blend)";

  return (
    <div className={`relative flex-shrink-0 ${className} overflow-hidden`}>
      <Image
        src="/logo.png"
        alt="Vellor Logo"
        fill
        sizes="64px"
        className="object-contain"
        /* 
          The provided PNG has a white background and a black logo.
          To make it work on our dark theme or custom dark backgrounds:
          1. invert(1): Makes the logo white and the background black.
          2. mix-blend-mode: screen: Makes the black background transparent,
             leaving only the white logo visible.
        */
        style={{ filter, mixBlendMode: mixBlendMode as any }}
        priority
      />
    </div>
  );
}
