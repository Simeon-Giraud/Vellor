import React from "react";
import Image from "next/image";

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative flex-shrink-0 ${className} overflow-hidden`}>
      <Image
        src="/logo.png"
        alt="Vellor Logo"
        fill
        className="object-contain"
        /* 
          The provided PNG has a white background and a black logo.
          To make it work on our dark theme:
          1. invert(1): Makes the logo white and the background black.
          2. mix-blend-mode: screen: Makes the black background transparent 
             against the dark theme, leaving only the white logo visible.
        */
        style={{ filter: "invert(1)", mixBlendMode: "screen" }}
        priority
      />
    </div>
  );
}
