"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle, ScanLine } from "lucide-react";
import Reveal from "./Reveal";
import { img, WHATSAPP_LINK } from "@/lib/site";

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-28 sm:py-36">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[160px]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-[32px] border border-gold/25 bg-panel p-8 sm:p-14">
            <div className="grid-lines absolute inset-0 opacity-50" />
            <div className="relative grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-glow" />
                  Direct line
                </span>
                <h2 className="font-display mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl">
                  Talk to a <span className="text-gold-gradient">human</span>,<br />not a bot.
                </h2>
                <p className="mt-5 max-w-md leading-relaxed text-muted">
                  Questions about your hair type, bulk orders, or tracking a parcel?
                  Message us on WhatsApp — a real member of Team Zulfira replies,
                  usually within the hour.
                </p>
                <motion.a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-base font-bold text-white shadow-[0_14px_45px_-10px_rgba(37,211,102,0.7)]"
                >
                  <MessageCircle className="h-5 w-5" />
                  Start WhatsApp Chat
                </motion.a>
                <p className="mt-4 text-xs text-muted">Mon–Sat · 9am–9pm PKT · Replies within ~1 hour</p>
              </div>

              <div className="flex justify-center lg:justify-end">
                <motion.div
                  whileHover={{ rotate: 1.5, scale: 1.02 }}
                  className="relative rounded-[26px] border border-white/12 bg-void/80 p-6 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
                >
                  <div className="relative mx-auto h-52 w-52 overflow-hidden rounded-2xl bg-white p-3">
                    <Image
                      src={img("/images/qr-whatsapp.png")}
                      alt="WhatsApp QR code"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-cream">
                    <ScanLine className="h-4 w-4 text-gold" />
                    Scan to chat instantly
                  </div>
                  <p className="mt-1 text-xs text-muted">Point your phone camera at the code</p>
                  <div className="ring-conic pointer-events-none absolute -inset-px -z-10 rounded-[27px] opacity-40 blur-[6px]" />
                </motion.div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
