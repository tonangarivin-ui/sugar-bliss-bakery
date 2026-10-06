import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseInitialized } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseInitialized();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "ID pesanan tidak valid." },
        { status: 400 }
      );
    }

    const [foundOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!foundOrder) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    let parsedItems = [];
    try {
      parsedItems = JSON.parse(foundOrder.itemsJson);
    } catch {
      parsedItems = [];
    }

    return NextResponse.json({
      ...foundOrder,
      items: parsedItems,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail pesanan." },
      { status: 500 }
    );
  }
}
