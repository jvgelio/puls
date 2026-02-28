import sharp from "sharp";
import path from "path";
import fs from "fs";

const ICONS_DIR = path.join(process.cwd(), "public", "icons");
const MASTER_SVG = path.join(ICONS_DIR, "icon-master.svg");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(MASTER_SVG);

  // Standard icons
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(ICONS_DIR, `icon-${size}x${size}.png`));
    console.log(`✓ icon-${size}x${size}.png`);
  }

  // Favicon sizes
  for (const size of [16, 32]) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(ICONS_DIR, `favicon-${size}x${size}.png`));
    console.log(`✓ favicon-${size}x${size}.png`);
  }

  // Apple touch icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(ICONS_DIR, "apple-touch-icon.png"));
  console.log("✓ apple-touch-icon.png");

  // Maskable icons: add extra padding (safe zone = inner 80%)
  // We resize the content to 80% and place it on a solid background
  const MASKABLE_SIZES = [192, 512];
  for (const size of MASKABLE_SIZES) {
    const contentSize = Math.round(size * 0.8);
    const padding = Math.round((size - contentSize) / 2);

    const resizedContent = await sharp(svgBuffer)
      .resize(contentSize, contentSize)
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 10, g: 10, b: 10, alpha: 1 },
      },
    })
      .composite([{ input: resizedContent, top: padding, left: padding }])
      .png()
      .toFile(path.join(ICONS_DIR, `icon-maskable-${size}x${size}.png`));
    console.log(`✓ icon-maskable-${size}x${size}.png`);
  }

  console.log("\nAll icons generated successfully.");
}

generateIcons().catch(console.error);
