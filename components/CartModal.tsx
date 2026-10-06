"use client";

import * as React from "react";
import Image from "next/image";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
  portion?: string;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CartModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartModalProps) {
  const { data: session } = useSession();

  // WhatsApp Checkout Form States
  const [customerName, setCustomerName] = React.useState("");
  const [syncedUser, setSyncedUser] = React.useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [deliveryMethod, setDeliveryMethod] = React.useState<"delivery" | "pickup">("delivery");
  const [deliveryDate, setDeliveryDate] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [checkoutSuccess, setCheckoutSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [createdOrderId, setCreatedOrderId] = React.useState<string | null>(null);

  // Auto-fill customer name if user is logged in
  if (session?.user?.name && syncedUser !== session.user.name && !customerName) {
    setSyncedUser(session.user.name);
    setCustomerName(session.user.name);
  }

  const handleClose = React.useCallback(() => {
    setCheckoutSuccess(false);
    setCreatedOrderId(null);
    setFormError("");
    onClose();
  }, [onClose]);

  // Keyboard Escape listener (R-32)
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleClose]);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  // Free packaging if subtotal > 200.000, otherwise Rp 10.000
  const packagingFee = subtotal > 0 && subtotal < 200000 ? 10000 : 0;
  const totalPrice = subtotal + packagingFee;

  const handleWhatsAppCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      setFormError("Keranjang belanja masih kosong. Silakan pilih menu terlebih dahulu.");
      return;
    }

    if (!customerName.trim()) {
      setFormError("Silakan masukkan nama lengkap Anda untuk pemesanan.");
      return;
    }

    if (!customerPhone.trim()) {
      setFormError("Silakan masukkan nomor WhatsApp Anda untuk konfirmasi pesanan.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      // 1. Simpan pesanan secara permanen ke database melalui POST /api/orders
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: customerPhone.trim(),
          deliveryType: deliveryMethod,
          address: notes.trim() || undefined,
          notes: `Tanggal: ${deliveryDate.trim() || "Segera"}. Catatan: ${notes.trim() || "-"}`,
          items,
          totalPrice,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Gagal menyimpan pesanan ke database.");
      }

      const orderId = data.orderId || data.id;
      setCreatedOrderId(orderId);

      // 2. Siapkan pesan WhatsApp terstruktur dengan referensi Order ID
      const itemsListText = items
        .map(
          (item) =>
            `• ${item.name} (${item.quantity}x) : ${formatIDR(item.price * item.quantity)}`
        )
        .join("\n");

      const message = `Halo Sugar Bliss Bakery! 🍰
Saya ingin memesan menu berikut (ID Pesanan: #${orderId}):

*Rincian Pesanan:*
${itemsListText}

*Rincian Pembayaran:*
• Subtotal: ${formatIDR(subtotal)}
• Kemasan & Box: ${packagingFee === 0 ? "Gratis (Promo Spesial)" : formatIDR(packagingFee)}
• *Total Akhir: ${formatIDR(totalPrice)}*

*Informasi Pemesan:*
• No. Referensi: #${orderId}
• Nama: ${customerName.trim()}
• No. WhatsApp: ${customerPhone.trim()}
• Metode: ${deliveryMethod === "delivery" ? "Pengiriman ke Alamat" : "Ambil di Outlet (Pickup)"}
• Tanggal / Waktu: ${deliveryDate.trim() || "Hari ini / Segera"}
• Catatan / Alamat: ${notes.trim() || "Tidak ada catatan khusus"}

Mohon konfirmasi ketersediaan dan nomor rekening pembayarannya ya. Terima kasih!`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/6281234567890?text=${encodedMessage}`;

      setCheckoutSuccess(true);
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      console.error("Error creating order:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pesanan.";
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brown/50 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer / Modal Container */}
      <div className="relative z-50 w-full max-w-2xl rounded-3xl bg-[#FAF4EB] border border-rose-border p-5 sm:p-7 text-brown shadow-2xl max-h-[92vh] flex flex-col animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-border/60">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-rose-soft border border-rose-border flex items-center justify-center text-rose">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="cart-title"
                className="text-xl sm:text-2xl font-serif font-bold text-brown"
              >
                Keranjang Belanja
              </h2>
              <p className="text-xs sm:text-sm text-brown-light">
                {items.length > 0
                  ? `${items.reduce((acc, i) => acc + i.quantity, 0)} item dipilih`
                  : "Belum ada item yang dipilih"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-brown hover:bg-rose-soft hover:text-rose transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose cursor-pointer"
            aria-label="Tutup keranjang"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {checkoutSuccess && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">
                  Pesanan Berhasil Disimpan & WhatsApp Dibuka!
                </p>
                {createdOrderId && (
                  <p className="text-xs font-mono font-medium text-emerald-800 mt-0.5">
                    ID Pesanan: <span className="underline">#{createdOrderId}</span>
                  </p>
                )}
                <p className="text-emerald-700 mt-1 text-xs">
                  Data pesanan Anda telah tersimpan secara permanen di database. Tab WhatsApp telah terbuka untuk konfirmasi instan dengan tim Sugar Bliss.
                </p>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            /* Empty State (R-27 compliant) */
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-rose-soft flex items-center justify-center text-rose mb-1">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-brown">
                Keranjang Belanja Masih Kosong
              </h3>
              <p className="text-sm text-brown-light max-w-sm">
                Nikmati hari Anda dengan sesuatu yang manis. Pilih cake lembut, cupcake artisan, atau kopi pendamping dari katalog kami.
              </p>
              <Button
                variant="rose"
                size="default"
                className="mt-3"
                onClick={() => {
                  handleClose();
                  const catalog = document.getElementById("catalog");
                  catalog?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Pilih Menu di Katalog
              </Button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brown-light">
                  <span>Daftar Menu</span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-rose hover:underline cursor-pointer"
                  >
                    Kosongkan Semua
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 sm:gap-4 p-3 rounded-2xl bg-white border border-rose-border/50 shadow-xs"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-rose-soft shrink-0 border border-rose-border/40">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Detail */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-brown truncate">
                            {item.name}
                          </h4>
                          <Badge variant="cream" className="text-[10px] py-0 px-2">
                            {item.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-rose font-semibold mt-0.5">
                          {formatIDR(item.price)}
                        </p>
                        {item.portion && (
                          <p className="text-[11px] text-brown-light truncate">
                            {item.portion}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls & Delete */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="flex items-center bg-rose-soft rounded-full border border-rose-border p-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="h-7 w-7 rounded-full flex items-center justify-center text-brown hover:bg-white hover:text-rose transition-colors cursor-pointer"
                            aria-label={`Kurangi jumlah ${item.name}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-brown">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="h-7 w-7 rounded-full flex items-center justify-center text-brown hover:bg-white hover:text-rose transition-colors cursor-pointer"
                            aria-label={`Tambah jumlah ${item.name}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 text-brown-light hover:text-rose hover:bg-rose-soft rounded-lg transition-colors cursor-pointer"
                          aria-label={`Hapus ${item.name} dari keranjang`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="rounded-2xl bg-white border border-rose-border/60 p-4 space-y-2.5">
                <div className="flex justify-between text-sm text-brown-light">
                  <span>Subtotal Pesanan</span>
                  <span className="font-semibold text-brown">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-brown-light">
                  <span className="flex items-center gap-1.5">
                    Box Eksklusif & Packaging
                    {packagingFee === 0 && (
                      <Badge variant="rose" className="text-[10px] py-0 px-1.5">
                        Gratis
                      </Badge>
                    )}
                  </span>
                  <span className="font-semibold text-brown">
                    {packagingFee === 0 ? "Rp 0" : formatIDR(packagingFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-rose-border/60 flex justify-between items-center text-base sm:text-lg font-bold text-brown">
                  <span>Total Pembayaran</span>
                  <span className="text-rose text-lg sm:text-xl font-serif">
                    {formatIDR(totalPrice)}
                  </span>
                </div>
              </div>

              {/* WhatsApp Checkout Form */}
              <form
                onSubmit={handleWhatsAppCheckout}
                className="rounded-2xl bg-white border border-rose-border/60 p-4 sm:p-5 space-y-3.5"
              >
                <div className="flex items-center gap-2 pb-1 border-b border-rose-border/40">
                  <Send className="h-4 w-4 text-rose" />
                  <h4 className="text-sm font-bold text-brown">
                    Form Pemesanan via WhatsApp
                  </h4>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="customerName"
                      className="block text-xs font-semibold text-brown mb-1"
                    >
                      Nama Lengkap <span className="text-rose">*</span>
                      {session?.user?.name && customerName === session.user.name && (
                        <span className="text-[10px] text-rose font-normal ml-1">
                          (Dari akun)
                        </span>
                      )}
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Contoh: Amanda Putri"
                      className="w-full h-10 px-3 rounded-xl border border-rose-border bg-[#FAF4EB]/40 text-brown text-sm focus:outline-none focus:ring-2 focus:ring-rose"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="customerPhone"
                      className="block text-xs font-semibold text-brown mb-1"
                    >
                      Nomor WhatsApp <span className="text-rose">*</span>
                    </label>
                    <input
                      id="customerPhone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full h-10 px-3 rounded-xl border border-rose-border bg-[#FAF4EB]/40 text-brown text-sm focus:outline-none focus:ring-2 focus:ring-rose"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-brown mb-1">
                      Metode Pemesanan
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("delivery")}
                        className={`h-10 px-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          deliveryMethod === "delivery"
                            ? "bg-rose text-white border-rose"
                            : "bg-[#FAF4EB]/40 text-brown border-rose-border hover:bg-rose-soft"
                        }`}
                      >
                        Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("pickup")}
                        className={`h-10 px-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          deliveryMethod === "pickup"
                            ? "bg-rose text-white border-rose"
                            : "bg-[#FAF4EB]/40 text-brown border-rose-border hover:bg-rose-soft"
                        }`}
                      >
                        Ambil di Toko
                      </button>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="deliveryDate"
                      className="block text-xs font-semibold text-brown mb-1"
                    >
                      Tanggal Pengiriman / Ambil
                    </label>
                    <input
                      id="deliveryDate"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-rose-border bg-[#FAF4EB]/40 text-brown text-sm focus:outline-none focus:ring-2 focus:ring-rose"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-xs font-semibold text-brown mb-1"
                  >
                    Alamat Lengkap / Catatan Khusus
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tuliskan alamat pengiriman, ucapan pada kartu kue, atau lilin yang dibutuhkan..."
                    className="w-full p-3 rounded-xl border border-rose-border bg-[#FAF4EB]/40 text-brown text-sm focus:outline-none focus:ring-2 focus:ring-rose resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="rose"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full font-bold shadow-md hover:shadow-lg transition-shadow cursor-pointer disabled:opacity-70"
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  {isSubmitting
                    ? "Menyimpan Pesanan..."
                    : `Pesan Sekarang via WhatsApp (${formatIDR(totalPrice)})`}
                </Button>

                <p className="text-[11px] text-center text-brown-light">
                  Pesanan akan langsung dikirimkan ke WhatsApp Customer Service Sugar Bliss Bakery untuk konfirmasi instan.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
