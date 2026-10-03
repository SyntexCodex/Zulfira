import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { NAV_LINKS, WHATSAPP_LINK, CONTACT } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-pine-deep text-ivory/85">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="relative h-11 w-11 overflow-hidden rounded-full bg-white ring-1 ring-white/20">
                <Image src="/brand/logo.webp" alt="Zulfira logo" fill className="object-cover" />
              </span>
              <span className="leading-none">
                <span className="font-display block text-[22px] font-bold tracking-[0.14em] text-white">
                  ZULFIRA
                </span>
                <span className="block text-[9.5px] font-semibold uppercase tracking-[0.32em] text-gold-soft">
                  Hair Care
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/65">
              Pakistan's home of honest, botanical hair care. Two signature formulas —
              one complete ritual — for hair that speaks before you do.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white"
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-gold-soft">Shop</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/product/revitalizing-hair-oil" className="hover:text-white">Hair Oil</Link></li>
              <li><Link href="/product/sulphate-free-shampoo" className="hover:text-white">Shampoo</Link></li>
              <li><Link href="/product/complete-ritual-bundle" className="hover:text-white">Ritual Bundle</Link></li>
              <li><Link href="/shop" className="hover:text-white">All Products</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-gold-soft">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV_LINKS.filter((l) => l.label !== "Home" && l.label !== "Shop").map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-gold-soft">Get in touch</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft" />{CONTACT.address}</li>
              <li className="flex items-start gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft" />{CONTACT.email}</li>
              <li className="flex items-start gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft" />{CONTACT.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/12 pt-6 text-xs text-ivory/50 sm:flex-row">
          <span>© {new Date().getFullYear()} Zulfira Hair Care. All rights reserved.</span>
          <span className="uppercase tracking-[0.2em]">Cash on Delivery · Nationwide Shipping</span>
        </div>
      </div>
    </footer>
  );
}
