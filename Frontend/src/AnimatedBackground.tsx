import React from 'react';

// Simple animated SVG waves + subtle floating particles for premium feel
const AnimatedBackground: React.FC = () => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(120deg, #23262f 0%, #181a20 100%)',
    }}
  >
    {/* SVG wave animation */}
    <svg
      width="100%"
      height="320"
      viewBox="0 0 1920 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', bottom: 0, left: 0 }}
    >
      <defs>
        <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3f51" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#23262f" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path>
        <animate
          attributeName="d"
          dur="8s"
          repeatCount="indefinite"
          values="M0,160 C480,280 1440,40 1920,160 L1920,320 L0,320 Z;
                  M0,200 C600,120 1320,320 1920,200 L1920,320 L0,320 Z;
                  M0,160 C480,280 1440,40 1920,160 L1920,320 L0,320 Z"
        />
      </path>
      <path
        d="M0,160 C480,280 1440,40 1920,160 L1920,320 L0,320 Z"
        fill="url(#waveGradient)"
      />
    </svg>
    {/* Floating particles */}
    <svg
      width="100vw"
      height="100vh"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {[...Array(18)].map((_, i) => (
        <circle
          key={i}
          cx={Math.random() * 1920}
          cy={Math.random() * 900}
          r={Math.random() * 3 + 1}
          fill="#90caf9"
          opacity={0.08 + Math.random() * 0.18}
        >
          <animate
            attributeName="cy"
            values={`${Math.random() * 900};${Math.random() * 900}`}
            dur={`${8 + Math.random() * 8}s`}
            repeatCount="indefinite"
            keyTimes="0;1"
          />
        </circle>
      ))}
    </svg>
  </div>
);

export default AnimatedBackground;
