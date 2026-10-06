import { NextResponse } from "next/server";
import { db, ensureDatabaseInitialized } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDatabaseInitialized();

    const activeProducts = await db
      .select()
      .from(products)
      .where(eq(products.isAvailable, true));

    return NextResponse.json(activeProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar produk" },
      { status: 500 }
    );
  }
}
