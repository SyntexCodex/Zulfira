"use client";

import { useState } from "react";
import { PackageSearch, MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/site";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim() && phone.trim()) setDone(true);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="text-center">
        <p className="eyebrow-red">Order Status</p>
        <h1 className="section-title mt-3 text-4xl sm:text-5xl">Track Your Order</h1>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] text-muted">
          Enter the order details you received on WhatsApp and we'll look it up for you.
        </p>
      </div>

      <div className="card-soft mt-10 p-7 sm:p-9">
        {done ? (
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blush">
              <PackageSearch className="h-8 w-8 text-maroon" />
            </span>
            <h2 className="section-title mt-5 text-2xl">We're on it!</h2>
            <p className="mx-auto mt-3 max-w-sm text-[14.5px] text-muted">
              Our team is checking the status of your order. We'll send you an update on
              WhatsApp shortly.
            </p>
            <a
              href={`${WHATSAPP_LINK}?text=${encodeURIComponent(`Hello Zulfira! Please share the status of my order.\nOrder: ${orderId}\nPhone: ${phone}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-sm font-bold text-white"
            >
              <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-bold">Order ID / Name</label>
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. the name you ordered with"
                className="input-clean w-full rounded-xl px-5 py-3.5 text-[15px]"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-bold">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03xx-xxxxxxx"
                inputMode="tel"
                className="input-clean w-full rounded-xl px-5 py-3.5 text-[15px]"
                required
              />
            </div>
            <button type="submit" className="btn-dark w-full rounded-full py-4 text-sm font-bold uppercase tracking-widest">
              Track Order
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
