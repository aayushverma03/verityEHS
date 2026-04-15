// Verity EHS Logo component
import Image from "next/image"

interface LogoProps {
  variant?: "full" | "mark"
  className?: string
}

export function Logo({ variant = "full", className = "" }: LogoProps) {
  if (variant === "mark") {
    return (
      <svg
        viewBox="0 0 68 76"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F7B6C" />
            <stop offset="100%" stopColor="#0A5C8A" />
          </linearGradient>
          <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#CCF2EC" />
          </linearGradient>
        </defs>
        <polygon
          points="34,0 68,19 68,57 34,76 0,57 0,19"
          fill="url(#hexGrad)"
        />
        <polygon
          points="34,10 61,25 61,51 34,66 7,51 7,25"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
        />
        <polyline
          points="16,38 28,50 52,26"
          fill="none"
          stroke="url(#checkGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 280 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hexGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F7B6C" />
          <stop offset="100%" stopColor="#0A5C8A" />
        </linearGradient>
        <linearGradient id="checkGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#CCF2EC" />
        </linearGradient>
      </defs>

      {/* Hexagon mark */}
      <polygon
        points="34,4 60,19 60,49 34,64 8,49 8,19"
        fill="url(#hexGradFull)"
      />
      <polygon
        points="34,12 54,24 54,44 34,56 14,44 14,24"
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
      />
      <polyline
        points="20,34 29,43 48,24"
        fill="none"
        stroke="url(#checkGradFull)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Verity text */}
      <text
        x="72"
        y="42"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="28"
        fontWeight="700"
        letterSpacing="-0.5"
        fill="#0D3D52"
      >Verity</text>

      {/* EHS text */}
      <text
        x="174"
        y="42"
        fontFamily="Arial, sans-serif"
        fontSize="28"
        fontWeight="300"
        letterSpacing="1"
        fill="#0F7B6C"
      >EHS</text>
    </svg>
  )
}
