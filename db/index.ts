import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://bakery_user:bakery_secret_pass_123@127.0.0.1:5432/sugarbliss";

declare global {
  var _pgClient: postgres.Sql | undefined;
}

export const client =
  globalThis._pgClient ??
  postgres(dbUrl, {
    prepare: false,
    onnotice: () => {},
  });

if (process.env.NODE_ENV !== "production") {
  globalThis._pgClient = client;
}

export const db = drizzle(client, { schema });

export const INITIAL_PRODUCTS = [
  {
    id: "classic-cakes",
    name: "Classic Cakes",
    slug: "classic-cakes",
    category: "Signature Cakes",
    description:
      "Sponge chiffon Earl Grey aromatik berlapis krim susu lembut, selai berry liar homemade, dan hiasan kelopak edible pilihan.",
    price: 285000,
    imageUrl: "/cake.png",
    isAvailable: true,
  },
  {
    id: "decadent-desserts",
    name: "Decadent Desserts",
    slug: "decadent-desserts",
    category: "Cupcake & Mousse Box",
    description:
      "Koleksi 4 cupcake istimewa: Belgian Dark Chocolate Ganache, Salted Caramel Cream, Velvet Berry, dan Pistachio Rose.",
    price: 165000,
    imageUrl: "/cupcake.png",
    isAvailable: true,
  },
  {
    id: "custom-creations",
    name: "Custom Creations",
    slug: "custom-creations",
    category: "Celebration Cake",
    description:
      "Kue perayaan personal berdesain estetik dengan pilihan rasa vanila Madagaskar atau cokelat Belgia, lengkap dengan topper kustom.",
    price: 380000,
    imageUrl: "/cake.png",
    isAvailable: true,
  },
  {
    id: "artisan-latte",
    name: "Artisan Hazelnut Velvet Latte",
    slug: "artisan-latte",
    category: "Artisan Coffee",
    description:
      "Espresso biji Flores Bajawa berpadu susu oat gurih dan sirup hazelnut panggang. Pendamping terbaik untuk kue manis Anda.",
    price: 38000,
    imageUrl: "/latte.png",
    isAvailable: true,
  },
];

let initPromise: Promise<void> | null = null;

export async function ensureDatabaseInitialized(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 1. Create tables if they do not exist
      await client.unsafe(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          email_verified BOOLEAN NOT NULL DEFAULT FALSE,
          image TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          expires_at TIMESTAMP NOT NULL,
          token TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          ip_address TEXT,
          user_agent TEXT,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY,
          account_id TEXT NOT NULL,
          provider_id TEXT NOT NULL,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          access_token TEXT,
          refresh_token TEXT,
          id_token TEXT,
          access_token_expires_at TIMESTAMP,
          refresh_token_expires_at TIMESTAMP,
          scope TEXT,
          password TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS verifications (
          id TEXT PRIMARY KEY,
          identifier TEXT NOT NULL,
          value TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          category TEXT NOT NULL,
          description TEXT,
          price INTEGER NOT NULL,
          image_url TEXT,
          is_available BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          customer_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          delivery_type TEXT NOT NULL DEFAULT 'delivery',
          address TEXT,
          items_json TEXT NOT NULL,
          total_price INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);

      // 2. Check if products table is empty, if so, seed initial data
      const existingProducts = await client`SELECT COUNT(*)::int as count FROM products`;
      const count = Number(existingProducts[0]?.count ?? 0);

      if (count === 0) {
        for (const p of INITIAL_PRODUCTS) {
          await client`
            INSERT INTO products (id, name, slug, category, description, price, image_url, is_available, created_at)
            VALUES (${p.id}, ${p.name}, ${p.slug}, ${p.category}, ${p.description}, ${p.price}, ${p.imageUrl}, ${p.isAvailable}, NOW())
            ON CONFLICT (id) DO NOTHING
          `;
        }
      }
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

// Trigger background initialization on module load
void ensureDatabaseInitialized().catch(() => {
  // Ignored in build / SSG environments where db file might not be accessed yet
});
