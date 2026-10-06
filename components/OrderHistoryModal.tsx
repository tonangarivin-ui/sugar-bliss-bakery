"use client";

import * as React from "react";
import {
  X,
  Receipt,
  Package,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface OrderRecord {
  id: string;
  customerName: string;
  phone: string;
  deliveryType: string;
  address: string | null;
  itemsJson: string;
  totalPrice: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrowseCatalog?: () => void;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          Selesai
        </span>
      );
    case "confirmed":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
          Terkonfirmasi
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          Dibatalkan
        </span>
      );
    case "pending":
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          Menunggu Konfirmasi
        </span>
      );
  }
}

export function OrderHistoryModal({
  isOpen,
  onClose,
  onBrowseCatalog,
}: OrderHistoryModalProps) {
  const [orders, setOrders] = React.useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchOrders = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        setError("Sesi login berakhir. Silakan login kembali untuk melihat riwayat.");
        setOrders([]);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Gagal mengambil daftar pesanan.");
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memuat riwayat pesanan. Periksa koneksi internet Anda.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchOrders();
    }
  }, [isOpen, fetchOrders]);

  // Escape key & body scroll lock
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-history-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brown/50 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div className="relative z-50 w-full max-w-3xl rounded-3xl bg-[#FAF4EB] border border-rose-border p-5 sm:p-8 text-brown shadow-2xl max-h-[90vh] flex flex-col transition-all duration-200 animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-border/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-soft border border-rose-border flex items-center justify-center text-rose">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="order-history-title"
                className="text-xl sm:text-2xl font-serif font-bold text-brown"
              >
                Riwayat Pesanan
              </h2>
              <p className="text-xs sm:text-sm text-brown-light">
                Daftar transaksi dan status pemesanan bakery Anda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={fetchOrders}
              disabled={isLoading}
              title="Perbarui daftar"
              aria-label="Perbarui daftar pesanan"
              className="rounded-full p-2 text-brown hover:bg-rose-soft hover:text-rose transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-brown hover:bg-rose-soft hover:text-rose transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose cursor-pointer"
              aria-label="Tutup riwayat pesanan"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4">
          {isLoading && orders.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="h-8 w-8 text-rose animate-spin" />
              <p className="text-sm font-medium text-brown-light">
                Memuat riwayat pesanan...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                className="text-xs shrink-0"
              >
                Coba Lagi
              </Button>
            </div>
          )}

          {!isLoading && !error && orders.length === 0 && (
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-rose-soft flex items-center justify-center text-rose mb-1">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-brown">
                Belum Ada Riwayat Pesanan
              </h3>
              <p className="text-sm text-brown-light max-w-sm">
                Anda belum melakukan pemesanan di Sugar Bliss. Pilih cake lembut atau kopi artisan dari katalog kami!
              </p>
              {onBrowseCatalog && (
                <Button
                  variant="rose"
                  size="default"
                  className="mt-3"
                  onClick={() => {
                    onClose();
                    onBrowseCatalog();
                  }}
                >
                  Jelajahi Katalog Menu
                </Button>
              )}
            </div>
          )}

          {orders.map((order) => {
            let parsedItems: OrderItem[] = [];
            try {
              parsedItems = JSON.parse(order.itemsJson);
            } catch {
              parsedItems = [];
            }

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-white border border-rose-border/70 p-4 sm:p-5 shadow-xs space-y-3 transition-all hover:border-rose/50"
              >
                {/* Order Meta Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-border/40">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-brown bg-rose-soft px-2.5 py-1 rounded-lg border border-rose-border">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    {getStatusBadge(order.status)}
                    <Badge variant="cream" className="text-[11px] capitalize">
                      {order.deliveryType === "pickup" ? "Ambil di Toko" : "Pengiriman"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-brown-light">
                    <Calendar className="h-3.5 w-3.5 text-rose" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-brown-light flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-rose" />
                    <span>Daftar Menu:</span>
                  </div>

                  <div className="space-y-1.5 pl-5 border-l-2 border-rose-border/50 text-sm">
                    {parsedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs sm:text-sm text-brown"
                      >
                        <span className="font-medium">
                          {item.name}{" "}
                          <span className="text-brown-light font-normal">
                            ({item.quantity}x)
                          </span>
                        </span>
                        <span className="font-semibold text-brown">
                          {formatIDR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes / Address */}
                {(order.notes || order.address) && (
                  <div className="text-xs text-brown-light bg-[#FAF4EB]/60 p-2.5 rounded-xl border border-rose-border/40">
                    {order.address && (
                      <p>
                        <span className="font-semibold text-brown">Alamat:</span>{" "}
                        {order.address}
                      </p>
                    )}
                    {order.notes && (
                      <p className="mt-0.5">
                        <span className="font-semibold text-brown">Catatan:</span>{" "}
                        {order.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Footer Total & Customer Info */}
                <div className="pt-2 border-t border-rose-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                  <div className="text-brown-light">
                    Pemesan: <span className="font-medium text-brown">{order.customerName}</span> ({order.phone})
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-brown-light">Total Pembayaran:</span>
                    <span className="text-base font-serif font-bold text-rose">
                      {formatIDR(order.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-rose-border/60 flex justify-end">
          <Button variant="default" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
