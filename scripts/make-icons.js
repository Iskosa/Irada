import fs from 'fs'
import { Resvg } from '@resvg/resvg-js'

const modernBrightVioletSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <defs>
    <!-- Background Ambient Glow -->
    <radialGradient id="bgGlow" cx="50%" cy="46%" r="55%">
      <stop offset="0%" stop-color="#9333ea" stop-opacity="0.6"/>
      <stop offset="45%" stop-color="#581c87" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#09090b" stop-opacity="0"/>
    </radialGradient>

    <!-- Super Bright Neon Violet Gradient -->
    <linearGradient id="boltGrad" x1="240" y1="65" x2="280" y2="445" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="12%" stop-color="#f5d0fe"/>
      <stop offset="35%" stop-color="#d946ef"/>
      <stop offset="70%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>

    <!-- Side Facet for 3D Modern Depth -->
    <linearGradient id="facetGrad" x1="160" y1="200" x2="320" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="40%" stop-color="#e879f9" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#6b21a8" stop-opacity="0.2"/>
    </linearGradient>

    <!-- Intense Violet Outer Glow Filter -->
    <filter id="neonBlur" x="80" y="20" width="352" height="472" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="32" result="blurWide"/>
      <feGaussianBlur stdDeviation="12" result="blurTight"/>
      <feMerge>
        <feMergeNode in="blurWide"/>
        <feMergeNode in="blurTight"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Sleek Glass Border -->
    <linearGradient id="borderGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0.8"/>
      <stop offset="40%" stop-color="#7c3aed" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#d946ef" stop-opacity="0.6"/>
    </linearGradient>
  </defs>

  <!-- Modern Deep Dark Rounded App Icon Base -->
  <rect width="512" height="512" rx="118" fill="#09090b"/>
  <rect x="10" y="10" width="492" height="492" rx="108" fill="#110d1a" stroke="url(#borderGrad)" stroke-width="4.5"/>

  <!-- Radial Violet Bloom behind icon -->
  <rect width="512" height="512" rx="118" fill="url(#bgGlow)"/>

  <!-- Vibrant Neon Purple Halo Glow -->
  <path d="M296 68 L160 262 L248 262 L212 444 L352 216 L264 216 Z" 
        fill="#c084fc" opacity="0.65" filter="url(#neonBlur)"/>

  <!-- Secondary Electric Violet Glow -->
  <path d="M296 68 L160 262 L248 262 L212 444 L352 216 L264 216 Z" 
        fill="#a855f7" opacity="0.8"/>

  <!-- Razor-Sharp Main Modern Bolt -->
  <path d="M296 68 L160 262 L248 262 L212 444 L352 216 L264 216 Z" 
        fill="url(#boltGrad)"/>

  <!-- Left Facet Light Reflection (3D Modern look) -->
  <path d="M296 68 L160 262 L248 262 L236 330 L264 216 Z" 
        fill="url(#facetGrad)"/>

  <!-- Electric White Highlight Spine -->
  <path d="M288 78 L176 254 L244 254" 
        stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
</svg>`

// 1. Save SVG favicon
fs.writeFileSync('public/favicon.svg', modernBrightVioletSvg)

// 2. Render high-res PNG icons
for (const size of [192, 512]) {
  const resvg = new Resvg(modernBrightVioletSvg, {
    fitTo: { mode: 'width', value: size },
  })
  const pngData = resvg.render()
  fs.writeFileSync(`public/icon-${size}.png`, pngData.asPng())
  console.log(`Rendered bright violet icon-${size}.png (${size}x${size})`)
}
