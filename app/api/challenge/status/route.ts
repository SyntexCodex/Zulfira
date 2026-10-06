export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getDb } from "@/lib/db";
import { ok, err, dbRequired } from "@/lib/api";
import { programEnabled } from "@/lib/discounts";

/** First name + last initial, e.g. "Fatima K". */
function displayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "—";
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}`;
}

// PUBLIC — current challenge round + top-10 leaderboard (by verified checkins).
export async function GET() {
  const db = getDb();
  if (!db) return dbRequired();
  const { enabled } = await programEnabled(db, "challenge_30");
  if (!enabled) return ok({ enabled: false });

  // Prefer the running round, fall back to an open (signup) round.
  const round =
    (await db.challengeRound.findFirst({
      where: { status: "running" },
      orderBy: { createdAt: "desc" },
    })) ??
    (await db.challengeRound.findFirst({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
    }));
  if (!round) return ok({ enabled: true, round: null });

  const challengerCount = await db.challenger.count({ where: { roundId: round.id } });

  // Top 10 challengers by verified checkin count.
  const top = await db.challengeCheckin.groupBy({
    by: ["challengerId"],
    where: { verified: true, challenger: { roundId: round.id } },
    _count: { challengerId: true },
    orderBy: { _count: { challengerId: "desc" } },
    take: 10,
  });
  const leaders = await db.challenger.findMany({
    where: { id: { in: top.map((t) => t.challengerId) } },
    select: { id: true, name: true, handle: true },
  });
  const byId = new Map(leaders.map((l) => [l.id, l]));
  const leaderboard = top.map((t) => {
    const l = byId.get(t.challengerId);
    return {
      name: l ? displayName(l.name) : "—",
      handle: l?.handle ?? "",
      checkins: t._count.challengerId,
    };
  });

  return ok({
    enabled: true,
    round: {
      id: round.id,
      name: round.name,
      status: round.status,
      startDate: round.startDate.toISOString(),
      endDate: round.endDate.toISOString(),
      challengerCount,
      maxChallengers: round.maxChallengers,
    },
    leaderboard,
  });
}
