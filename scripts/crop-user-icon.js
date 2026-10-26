import sharp from 'sharp'
import fs from 'fs'

const imgPath =
  'C:/Users/Нурмухаммед/.gemini/antigravity/brain/ccee744e-dbcb-474a-894d-d74860de9c02/.user_uploaded/media_1792307015713_ecf249b7.jpg'

async function run() {
  // 1. Extract the exact icon square (614x614)
  const cropped = await sharp(imgPath)
    .extract({ left: 205, top: 205, width: 614, height: 614 })
    .toBuffer()

  // 2. Create clean rounded squircle mask for transparency around corners
  const maskSvg = Buffer.from(`
    <svg width="614" height="614" viewBox="0 0 614 614">
      <rect width="614" height="614" rx="135" ry="135" fill="#ffffff"/>
    </svg>
  `)

  // 3. Composite with mask
  const masked = await sharp(cropped)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer()

  // 4. Save PNG icons
  await sharp(masked).resize(512, 512).toFile('public/icon-512.png')
  await sharp(masked).resize(192, 192).toFile('public/icon-192.png')
  await sharp(masked).resize(64, 64).toFile('public/favicon.png')
  await sharp(masked).resize(256, 256).toFile('public/app-icon.png')

  // 5. Create an SVG wrapper for favicon.svg that embeds this exact high-res image
  const base64Png = masked.toString('base64')
  const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <image href="data:image/png;base64,${base64Png}" width="512" height="512"/>
  </svg>`
  fs.writeFileSync('public/favicon.svg', svgFavicon)

  console.log('Generated all user icons successfully!')
}

run().catch(console.error)

