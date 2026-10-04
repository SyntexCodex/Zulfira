const ITEMS = ["ZULFIRA", "ZULFIRA", "ZULFIRA", "ZULFIRA", "ZULFIRA", "ZULFIRA"];

export default function Marquee() {
  return (
    <div className="overflow-hidden bg-ink py-4">
      <div className="flex w-max animate-marquee">
        {[...ITEMS, ...ITEMS].map((t, i) => (
          <span key={i} className="flex items-center">
            <span className="whitespace-nowrap px-8 font-display text-xl font-medium tracking-[0.3em] text-white">
              -{t}-
            </span>
            <span className="h-1.5 w-1.5 rotate-45 bg-maroon" />
          </span>
        ))}
      </div>
    </div>
  );
}
