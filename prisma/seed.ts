/**
 * prisma/seed.ts — demo data for local dev / first deploy.
 * Run: npx prisma db seed   (or: npm run db:seed)
 *
 * Seeds: 2 products (current placeholder prices), one demo investor (100% of
 * Hair Oil), a few sample expenses, and a starter admin login.
 *
 * ⚠️  Change the admin password immediately after first login.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  // --- Products -----------------------------------------------------------
  const oil = await db.product.upsert({
    where: { slug: "revitalizing-hair-oil" },
    update: {},
    create: {
      name: "Zulfira Revitalizing Hair Oil",
      slug: "revitalizing-hair-oil",
      sku: "ZL-OIL-200",
      tagline: "Deep nourishment, weightless shine",
      size: "200 ml",
      salePrice: 1899,
      compareAt: 2499,
      unitCost: 650,
      stockQty: 120,
      lowStockLevel: 20,
      image: "/products/oil-front.webp",
      gallery: ["/products/oil-front.webp", "/products/oil-detail.webp"],
      isActive: true,
    },
  });

  const shampoo = await db.product.upsert({
    where: { slug: "sulphate-free-shampoo" },
    update: {},
    create: {
      name: "Zulfira Sulphate-Free Shampoo",
      slug: "sulphate-free-shampoo",
      sku: "ZL-SHP-250",
      tagline: "Gentle cleanse, healthy scalp",
      size: "250 ml",
      salePrice: 1499,
      compareAt: 1899,
      unitCost: 420,
      stockQty: 150,
      lowStockLevel: 20,
      image: "/products/shampoo-front.webp",
      gallery: ["/products/shampoo-front.webp"],
      isActive: true,
    },
  });

  // --- Demo investor (100% of Hair Oil) ------------------------------------
  const investor = await db.investor.upsert({
    where: { id: "seed-investor-1" },
    update: {},
    create: {
      id: "seed-investor-1",
      name: "Demo Investor",
      phone: "0300-0000000",
      notes: "Seed investor — replace with real investors in /admin.",
    },
  });

  await db.productInvestor.upsert({
    where: { productId_investorId: { productId: oil.id, investorId: investor.id } },
    update: { profitSharePct: 100 },
    create: { productId: oil.id, investorId: investor.id, profitSharePct: 100 },
  });

  await db.investment.create({
    data: {
      productId: oil.id,
      investorId: investor.id,
      amount: 100000,
      notes: "Seed capital — first production batch",
    },
  });

  // --- Sample expenses ------------------------------------------------------
  const expenses: Array<{
    category: "RAW_MATERIAL" | "PACKAGING" | "DELIVERY" | "MARKETING" | "OTHER";
    productId: string | null;
    amount: number;
    note: string;
  }> = [
    { category: "RAW_MATERIAL", productId: oil.id, amount: 45000, note: "Argan, coconut & castor oils (bulk)" },
    { category: "PACKAGING", productId: oil.id, amount: 12000, note: "Bottles, labels & boxes — batch 1" },
    { category: "RAW_MATERIAL", productId: shampoo.id, amount: 28000, note: "Surfactants, keratin, aloe vera" },
    { category: "MARKETING", productId: null, amount: 15000, note: "Launch ads (general)" },
    { category: "DELIVERY", productId: null, amount: 8000, note: "Courier top-up (general)" },
  ];
  for (const e of expenses) {
    await db.expense.create({ data: e });
  }

  // --- Starter admin ---------------------------------------------------------
  const passwordHash = await bcrypt.hash("zulfira123", 10);
  await db.adminUser.upsert({
    where: { email: "admin@zulfira.pk" },
    update: {},
    create: {
      name: "Store Owner",
      email: "admin@zulfira.pk",
      passwordHash,
      role: "OWNER",
    },
  });

  // --- Default alert toggles --------------------------------------------------
  for (const key of ["alert_new_order", "alert_low_stock", "alert_daily_summary", "alert_returns"]) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value: "1" } });
  }

  console.log("✅ Seed complete.");
  console.log("   Admin login: admin@zulfira.pk / zulfira123  (CHANGE THIS PASSWORD!)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
