"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WHATSAPP_LINK } from "@/lib/site";

export default function WhatsAppFloat() {
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowTip(true), 2500);
    const t2 = setTimeout(() => setShowTip(false), 9000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-5 z-50 flex items-center gap-3">
      <AnimatePresence>
        {showTip && (
          <motion.span
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="hidden rounded-full bg-white px-4 py-2.5 text-[13px] font-medium text-ink shadow-xl ring-1 ring-black/10 sm:block"
          >
            Need Help? Chat with us
          </motion.span>
        )}
      </AnimatePresence>
      <motion.a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Zulfira on WhatsApp"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_10px_35px_-5px_rgba(37,211,102,0.7)]"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
        <svg viewBox="0 0 24 24" className="relative h-7 w-7 fill-white" aria-hidden>
          <path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.08-.13-.28-.2-.58-.35M12.04 2C6.56 2 2.1 6.45 2.1 11.93c0 1.75.46 3.46 1.34 4.97L2 22l5.23-1.37a9.9 9.9 0 0 0 4.81 1.23c5.48 0 9.93-4.45 9.93-9.93 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2" />
        </svg>
      </motion.a>
    </div>
  );
}
