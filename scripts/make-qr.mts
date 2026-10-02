/**
 * Generates public/images/qr-whatsapp.png — a QR code that opens the
 * Zulfira WhatsApp chat. Run with: npm run qr
 */
import QRCode from "qrcode";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const WHATSAPP_NUMBER = process.env.ZULFIRA_WHATSAPP || "923001234567";
const out = join(root, "public", "images", "qr-whatsapp.png");

mkdirSync(dirname(out), { recursive: true });

await QRCode.toFile(out, `https://wa.me/${WHATSAPP_NUMBER}`, {
  width: 640,
  margin: 2,
  color: { dark: "#0a0a0e", light: "#ffffff" },
  errorCorrectionLevel: "M",
});

console.log(`QR code written to ${out} (wa.me/${WHATSAPP_NUMBER})`);
