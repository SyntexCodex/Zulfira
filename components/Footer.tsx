import { Sparkles } from "lucide-react";
import { NAV_LINKS, WHATSAPP_LINK } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative border-t border-gold/15 bg-panel/70">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl ring-conic p-[2px]">
                <span className="flex h-full w-full items-center justify-center rounded-[10px] bg-void">
                  <Sparkles className="h-4 w-4 text-gold" />
                </span>
              </span>
              <span className="font-display text-xl font-extrabold tracking-[0.22em]">
                ZULF<span className="text-gold-gradient">IRA</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Futuristic hair care, crafted for Pakistan. Signature Hair Oil &amp; Shampoo —
              order in a minute with Cash on Delivery or online payment.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-muted">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-cream/80 transition-colors hover:text-gold">{l.label}</a>
                </li>
              ))}
              <li>
                <a href="#order" className="text-cream/80 transition-colors hover:text-gold">Order Now</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-muted">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-cream/80 transition-colors hover:text-gold">
                  WhatsApp — chat with us
                </a>
              </li>
              <li className="text-muted">Mon–Sat · 9am–9pm PKT</li>
              <li className="text-muted">Delivery across Pakistan</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-7 text-xs text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} Zulfira Hair Care. All rights reserved.</span>
          <span className="tracking-[0.2em] uppercase">Crafted for the future of hair</span>
        </div>
      </div>
    </footer>
  );
}
