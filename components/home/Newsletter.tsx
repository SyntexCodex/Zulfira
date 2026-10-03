"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import Reveal from "../Reveal";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\S+@\S+\.\S+$/.test(email)) setDone(true);
  };

  return (
    <section className="bg-pine-deep">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <Reveal>
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="eyebrow" style={{ color: "#e8d5a3" }}>The Zulfira Letter</p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Hair wisdom, monthly. No spam.
            </h2>
            <p className="mt-3 max-w-md text-[15px] text-ivory/65">
              Rituals, ingredient stories and subscriber-only offers — straight to your inbox.
            </p>
            {done ? (
              <p className="mt-7 flex items-center gap-2 rounded-full bg-white/10 px-6 py-3.5 text-sm font-semibold text-white">
                <Check className="h-4 w-4 text-gold-soft" /> You're in! Welcome to the ritual.
              </p>
            ) : (
              <form onSubmit={submit} className="mt-7 flex w-full max-w-md gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="input-clean w-full rounded-full px-5 py-3.5 text-[15px]"
                />
                <button type="submit" aria-label="Subscribe" className="btn-gold flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full">
                  <Send className="h-5 w-5" />
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
