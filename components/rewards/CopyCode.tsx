"use client";

import { useState } from "react";

export default function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="group inline-flex items-center gap-4 rounded-2xl border-2 border-dashed border-gold/60 bg-gold/[0.07] px-8 py-5 transition hover:border-gold hover:bg-gold/[0.12]"
      aria-label={`Copy discount code ${code}`}
    >
      <span className="font-display text-3xl font-bold tracking-[0.2em] text-gold md:text-4xl">{code}</span>
      <span className="rounded-full bg-gold px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-black">
        {copied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
}
