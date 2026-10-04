export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { computeProductPnl, computeGlobalPnl } from "@/lib/pnl";
import type { GlobalPnl, ProductPnl } from "@/lib/pnl";

function parseDate(v: string | null): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}

function csvCell(v: string | number | null | undefined): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const fmt = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

/** CSV: per-product P&L rows, then per-investor payout rows. */
function toCsv(products: ProductPnl[]): string {
  const lines: string[] = [];
  lines.push(
    [
      "Product",
      "Invested",
      "Revenue",
      "Collected",
      "Expenses",
      "Returns Loss",
      "Net",
      "Margin %",
      "ROI %",
    ].join(",")
  );
  for (const p of products) {
    lines.push(
      [
        csvCell(p.productName),
        fmt(p.invested),
        fmt(p.revenue),
        fmt(p.collected),
        fmt(p.expensesTotal),
        fmt(p.returnsLoss),
        fmt(p.net),
        p.marginPct == null ? "" : fmt(p.marginPct),
        p.roiPct == null ? "" : fmt(p.roiPct),
      ].join(",")
    );
  }
  lines.push("");
  lines.push("Investor payouts");
  lines.push(["Product", "Investor", "Share %", "Invested", "Payout"].join(","));
  for (const p of products) {
    for (const inv of p.investors) {
      lines.push(
        [
          csvCell(p.productName),
          csvCell(inv.name),
          fmt(inv.sharePct),
          fmt(inv.amountInvested),
          fmt(inv.payout),
        ].join(",")
      );
    }
  }
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbRequired();
  const sp = req.nextUrl.searchParams;
  const productId = sp.get("productId") || undefined;
  const from = parseDate(sp.get("from"));
  const to = parseDate(sp.get("to"));
  const filter = { from, to };

  let products: ProductPnl[];
  let totals: GlobalPnl["totals"] | undefined;
  if (productId) {
    const p = await computeProductPnl(productId, filter);
    if (!p) return err("Product not found", 404);
    products = [p];
  } else {
    const g = await computeGlobalPnl(filter);
    products = g?.products ?? [];
    totals =
      g?.totals ?? {
        invested: 0,
        expenses: 0,
        revenue: 0,
        collected: 0,
        returnsLoss: 0,
        net: 0,
        deliveredOrders: 0,
        pipelineValue: 0,
        pipelineOrders: 0,
      };
  }

  if (sp.get("format") === "csv") {
    const csv = toCsv(products);
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="zulfira-pnl-${stamp}.csv"`,
      },
    });
  }

  return ok({ products, totals });
}
