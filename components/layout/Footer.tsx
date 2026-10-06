import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "@/components/SocialIcons";
import { CONTACT, SOCIAL_LINKS } from "@/lib/site";

const QUICK_LINKS = [
  { label: "Privacy Policy", href: "/policies/privacy-policy" },
  { label: "Refund Policy", href: "/policies/refund-policy" },
  { label: "Terms & Conditions", href: "/policies/terms-and-conditions" },
  { label: "Shipping Policy", href: "/policies/shipping-policy" },
  { label: "Track Your Order", href: "/track-order" },
  { label: "FAQs", href: "/faq" },
];

export default function Footer() {
  return (
    <footer className="bg-coal text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="relative h-11 w-11 overflow-hidden rounded-full bg-white">
                <Image src="/brand/logo.webp" alt="Zulfira logo" fill className="object-cover" />
              </span>
              <span className="leading-none">
                <span className="font-display block text-xl font-semibold tracking-[0.18em] text-gold">ZULFIRA</span>
                <span className="block text-[9px] font-medium uppercase tracking-[0.42em] text-white/55">
                  Hair Care
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-white/60">
              Honest, botanical hair care crafted in Pakistan — two signature formulas,
              one complete ritual, delivered to your doorstep.
            </p>
          </div>

          <div>
            <h4 className="text-[12px] font-extrabold uppercase tracking-[0.22em] text-gold">Quick Links</h4>
            <ul className="mt-5 space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13.5px] text-white/60 transition hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-extrabold uppercase tracking-[0.22em] text-gold">Contact Information</h4>
            <ul className="mt-5 space-y-3.5 text-[13.5px] text-white/60">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                <a href={`tel:${CONTACT.phoneDisplay.replace(/-/g, "")}`} className="hover:text-gold">
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                <span>{CONTACT.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                <span>{CONTACT.address}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-extrabold uppercase tracking-[0.22em] text-gold">Social Media</h4>
            <div className="mt-5 flex gap-2.5">
              {[
                { icon: FacebookIcon, label: "Facebook", href: SOCIAL_LINKS.facebook },
                { icon: InstagramIcon, label: "Instagram", href: SOCIAL_LINKS.instagram },
                { icon: TiktokIcon, label: "TikTok", href: SOCIAL_LINKS.tiktok },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-gold hover:text-gold"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-white/50">
              Follow the ritual — tips, routines and offers every week.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-[12px] text-white/40 sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} Zulfira Hair Care. All rights reserved.</span>
          <span className="uppercase tracking-[0.18em]">Cash on Delivery · Nationwide Shipping</span>
        </div>
      </div>
    </footer>
  );
}
