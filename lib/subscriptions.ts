/**
 * Subscribe & Save helper.
 *
 * Called after an order is placed to turn "subscribe" cart lines into
 * recurring Subscription rows. The coordinator wires this into the checkout
 * POST handler — the signature below is the contract, do not change it.
 */

export interface SubscriptionOrderInput {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  items: Array<{ productId: string; subscribe?: boolean }>;
}

/**
 * For every item with subscribe=true, create an active Subscription whose
 * first refill ships intervalDays from now.
 */
export async function createSubscriptionsForOrder(
  db: any,
  order: SubscriptionOrderInput,
  intervalDays: number
): Promise<{ id: string; productId: string }[]> {
  const created: { id: string; productId: string }[] = [];
  const nextShipDate = new Date(Date.now() + intervalDays * 24 * 3_600_000);
  for (const item of order.items ?? []) {
    if (!item.subscribe) continue;
    if (!item.productId) continue;
    const row = await db.subscription.create({
      data: {
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        city: order.city,
        productId: item.productId,
        intervalDays,
        nextShipDate,
        status: "active",
      },
      select: { id: true, productId: true },
    });
    created.push(row);
  }
  return created;
}
