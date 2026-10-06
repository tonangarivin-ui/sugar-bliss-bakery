import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseInitialized } from "@/db";
import { orders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const orderList = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    return NextResponse.json(orderList);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar pesanan." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Format request body tidak valid." },
        { status: 400 }
      );
    }

    const customerName = (body.customerName || body.name || "").toString().trim();
    const phone = (body.phone || body.customerPhone || "").toString().trim();
    const items = body.items;

    // Validasi input nama
    if (!customerName) {
      return NextResponse.json(
        { error: "Nama pelanggan wajib diisi." },
        { status: 400 }
      );
    }

    // Validasi input nomor telepon
    if (!phone) {
      return NextResponse.json(
        { error: "Nomor telepon/WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    // Validasi input items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Daftar menu pesanan tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Delivery type
    const deliveryType = body.deliveryType === "pickup" ? "pickup" : "delivery";
    const address = body.address ? String(body.address).trim() : null;
    const notes = body.notes ? String(body.notes).trim() : null;

    // Hitung total price jika tidak disediakan atau hitung dari items
    let totalPrice = Number(body.totalPrice);
    if (isNaN(totalPrice) || totalPrice <= 0) {
      const subtotal = items.reduce((acc, item) => {
        const p = Number(item.price) || 0;
        const q = Number(item.quantity) || 1;
        return acc + p * q;
      }, 0);
      const packagingFee = subtotal > 0 && subtotal < 200000 ? 10000 : 0;
      totalPrice = subtotal + packagingFee;
    }

    const itemsJson = typeof body.itemsJson === "string" ? body.itemsJson : JSON.stringify(items);

    const [newOrder] = await db
      .insert(orders)
      .values({
        customerName,
        phone,
        deliveryType,
        address,
        itemsJson,
        totalPrice: Math.round(totalPrice),
        status: "pending",
        notes,
      })
      .returning();

    const summary = {
      orderId: newOrder.id,
      id: newOrder.id,
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      deliveryType: newOrder.deliveryType,
      address: newOrder.address,
      totalPrice: newOrder.totalPrice,
      status: newOrder.status,
      notes: newOrder.notes,
      itemCount: items.length,
      createdAt: newOrder.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        orderId: newOrder.id,
        id: newOrder.id,
        summary,
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Gagal membuat pesanan baru." },
      { status: 500 }
    );
  }
}
