export function AtmosphericBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-50 overflow-hidden select-none"
    >
      {/* 1. Deep midnight foundation */}
      <div className="absolute inset-0 bg-[#0B0D13]" />

      {/* 2. Radial vignette for cinematic studio depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 20%, #151926 0%, #0D0F17 50%, #07080C 100%)',
        }}
      />

      {/* 3. Cyan / Electric Teal Aurora Glow (Upper left & center) */}
      <div
        className="absolute -top-[10%] left-[15%] w-[680px] h-[520px] rounded-full blur-[140px] opacity-25 mix-blend-screen pointer-events-none animate-pulse"
        style={{
          background:
            'radial-gradient(circle, rgba(56, 189, 248, 0.6) 0%, rgba(20, 184, 166, 0.3) 45%, transparent 70%)',
          animationDuration: '12s',
        }}
      />

      {/* 4. Violet / Indigo Aurora Core (Right & center) */}
      <div
        className="absolute top-[25%] -right-[5%] w-[640px] h-[580px] rounded-full blur-[150px] opacity-20 mix-blend-screen pointer-events-none animate-pulse"
        style={{
          background:
            'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(99, 102, 241, 0.25) 50%, transparent 75%)',
          animationDuration: '16s',
        }}
      />

      {/* 5. Cozy Warm Studio Lamp Rim Glow (Top right corner, aesthetic from workstation photo) */}
      <div
        className="absolute -top-[15%] right-[20%] w-[480px] h-[360px] rounded-full blur-[130px] opacity-15 mix-blend-screen pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(217, 119, 6, 0.15) 50%, transparent 70%)',
        }}
      />

      {/* 6. Deep bottom shadow anchor */}
      <div
        className="absolute bottom-0 inset-x-0 h-64 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(7, 8, 12, 0.85) 0%, rgba(7, 8, 12, 0) 100%)',
        }}
      />

      {/* 7. Subtle film grain texture overlay to eliminate gradient banding */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-overlay pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="irada-ambient-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#irada-ambient-noise)" />
      </svg>
    </div>
  )
}
