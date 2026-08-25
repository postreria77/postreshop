// One-time script: creates 20% discounted Stripe prices for all pasteles
// and saves the new price IDs to precio_descuentos in Turso.
//
// Run from project root:
//   npx tsx scripts/create-abuelo-discounts.ts
//
// Requires .env with: STRIPE_SECRET_KEY, ASTRO_DB_REMOTE_URL, ASTRO_DB_APP_TOKEN

import { createClient } from "@libsql/client";
import Stripe from "stripe";

// Manual .env loader (no dotenv dep needed)
import { readFileSync, existsSync } from "fs";
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

const turso = createClient({
  url: process.env.ASTRO_DB_REMOTE_URL!,
  authToken: process.env.ASTRO_DB_APP_TOKEN!,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function createDiscountPrice(
  priceId: string,
  label: string,
): Promise<string | null> {
  try {
    const current = await stripe.prices.retrieve(priceId);
    if (!current.unit_amount) return null;

    const discountedAmount = Math.round(current.unit_amount * 0.8);
    const newPrice = await stripe.prices.create({
      product: current.product as string,
      unit_amount: discountedAmount,
      currency: "mxn",
      nickname: `Día del Abuelo 2026 - ${label}`,
    });

    console.log(
      `  ✓ ${label}: $${current.unit_amount / 100} → $${discountedAmount / 100} [${newPrice.id}]`,
    );
    return newPrice.id;
  } catch (err: any) {
    console.error(`  ✗ ${label}: ${err.message}`);
    return null;
  }
}

async function main() {
  const result = await turso.execute(
    "SELECT id, nombre, precio, precioAnytime, precioGift FROM Pasteles WHERE archived = 0",
  );

  console.log(`\nProcessing ${result.rows.length} pasteles...\n`);

  for (const row of result.rows) {
    const nombre = row.nombre as string;
    console.log(`${nombre}:`);

    const descuentos: Record<string, string> = {};

    if (row.precio) {
      const id = await createDiscountPrice(row.precio as string, "tradicional");
      if (id) descuentos.tradicional = id;
    }
    if (row.precioAnytime) {
      const id = await createDiscountPrice(
        row.precioAnytime as string,
        "anytime",
      );
      if (id) descuentos.anytime = id;
    }
    if (row.precioGift) {
      const id = await createDiscountPrice(row.precioGift as string, "gift");
      if (id) descuentos.gift = id;
    }

    if (Object.keys(descuentos).length > 0) {
      await turso.execute({
        sql: "UPDATE Pasteles SET precio_descuentos = ? WHERE id = ?",
        args: [JSON.stringify(descuentos), row.id],
      });
    }
  }

  console.log(
    "\n✅ Done! Redeploy Vercel so slug pages pick up the new prices.",
  );
}

main().catch(console.error);
