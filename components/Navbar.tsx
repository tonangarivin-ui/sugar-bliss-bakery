"use client";

import * as React from "react";
import {
  ShoppingBag,
  Menu,
  X,
  PhoneCall,
  User,
  Receipt,
  LogOut,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut } from "@/lib/auth-client";
import { AuthModal } from "@/components/AuthModal";
import { OrderHistoryModal } from "@/components/OrderHistoryModal";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
}

export function Navbar({ cartCount, onOpenCart }: NavbarProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [historyModalOpen, setHistoryModalOpen] = React.useState(false);
  const [authModalTab, setAuthModalTab] = React.useState<"signin" | "signup">("signin");

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenSignIn = () => {
    setAuthModalTab("signin");
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleOpenHistory = () => {
    setHistoryModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const navLinks = [
    { label: "Katalog Kue", href: "#catalog" },
    { label: "Keunggulan", href: "#features" },
    { label: "Coffee Pairing", href: "#coffee" },
    { label: "Cerita Kami", href: "#about" },
    { label: "Kontak", href: "#contact" },
  ];

  const user = session?.user;

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#FAF4EB]/95 backdrop-blur-md shadow-sm border-b border-rose-border/60 py-3"
            : "bg-[#FAF4EB] border-b border-rose-border/40 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#hero"
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose rounded-lg"
            >
              <div className="h-10 w-10 rounded-full bg-rose-soft border border-rose-border flex items-center justify-center text-rose group-hover:scale-105 transition-transform duration-200 shadow-xs">
                <span className="font-serif font-black text-xl text-rose">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-brown group-hover:text-rose transition-colors">
                  Sugar Bliss
                </span>
                <span className="text-[10px] uppercase tracking-widest text-rose font-medium">
                  Artisan Bakery & Cafe
                </span>
              </div>
            </a>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Navigasi Utama">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-brown hover:text-rose transition-colors duration-150 py-1"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cart Button */}
              <button
                type="button"
                onClick={onOpenCart}
                aria-label={`Buka keranjang belanja (${cartCount} item)`}
                className="relative flex items-center justify-center h-10 sm:h-11 px-3 sm:px-4 rounded-full bg-rose-soft border border-rose-border text-brown hover:bg-[#ebd9d9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-rose mr-1.5" />
                <span className="text-xs sm:text-sm font-semibold hidden sm:inline text-brown">
                  Keranjang
                </span>
                <Badge
                  variant={cartCount > 0 ? "rose" : "default"}
                  className="ml-1 text-[11px] h-5 min-w-[20px] px-1.5 flex items-center justify-center font-bold"
                >
                  {cartCount}
                </Badge>
              </button>

              {/* Desktop Auth Section */}
              <div className="hidden md:flex items-center gap-2">
                {user ? (
                  /* Logged In State */
                  <div className="flex items-center gap-2">
                    {/* User Profile Avatar & Name */}
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-rose-border/70 shadow-xs"
                      title={user.email}
                    >
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.image}
                          alt={user.name || "User"}
                          className="h-6 w-6 rounded-full object-cover border border-rose-border"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-rose-soft border border-rose-border flex items-center justify-center text-rose font-bold text-xs">
                          {(user.name?.[0] || "U").toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-brown max-w-[100px] lg:max-w-[130px] truncate">
                        {user.name || user.email}
                      </span>
                    </div>

                    {/* Order History Button */}
                    <button
                      type="button"
                      onClick={handleOpenHistory}
                      className="flex items-center gap-1.5 h-10 px-3 rounded-full bg-[#FAF4EB] border border-rose-border text-xs font-semibold text-brown hover:bg-rose-soft hover:text-rose transition-colors cursor-pointer"
                    >
                      <Receipt className="h-4 w-4 text-rose" />
                      <span className="hidden lg:inline">Riwayat Pesanan</span>
                    </button>

                    {/* Sign Out Button */}
                    <button
                      type="button"
                      onClick={handleSignOut}
                      title="Keluar dari akun"
                      aria-label="Keluar dari akun"
                      className="flex items-center justify-center h-10 w-10 rounded-full bg-rose-soft border border-rose-border text-brown hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  /* Not Logged In State */
                  <Button
                    variant="outline-rose"
                    size="sm"
                    onClick={handleOpenSignIn}
                    className="cursor-pointer"
                  >
                    <LogIn className="h-4 w-4 mr-1 text-rose" />
                    Masuk / Daftar
                  </Button>
                )}
              </div>

              {/* Order Now CTA (Desktop Large screens) */}
              <Button
                variant="default"
                size="default"
                className="hidden xl:inline-flex"
                onClick={() => {
                  const catalog = document.getElementById("catalog");
                  catalog?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <PhoneCall className="h-4 w-4 mr-1 text-rose-soft" />
                Order Now
              </Button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-rose-soft border border-rose-border text-brown hover:bg-[#ebd9d9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose cursor-pointer"
                aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-brown" />
                ) : (
                  <Menu className="h-5 w-5 text-brown" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 pb-4 border-t border-rose-border/60 animate-in fade-in-0 duration-200">
              {/* User Bar in Mobile Menu */}
              {user ? (
                <div className="p-3 mb-3 rounded-2xl bg-white border border-rose-border/70 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="h-10 w-10 rounded-full object-cover border border-rose-border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-rose-soft border border-rose-border flex items-center justify-center text-rose font-bold text-sm">
                        {(user.name?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-brown truncate">
                        {user.name || "Pelanggan"}
                      </p>
                      <p className="text-xs text-brown-light truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-rose-border/40">
                    <button
                      type="button"
                      onClick={handleOpenHistory}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-soft border border-rose-border text-xs font-semibold text-brown hover:bg-rose hover:text-white transition-colors cursor-pointer"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      Riwayat Pesanan
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FAF4EB] border border-rose-border text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3 p-3 rounded-2xl bg-rose-soft/60 border border-rose-border flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-brown">Sudah punya akun?</p>
                    <p className="text-[11px] text-brown-light">
                      Masuk untuk melihat pesanan Anda
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="rose"
                      size="sm"
                      onClick={handleOpenSignIn}
                      className="text-xs h-8 px-3 cursor-pointer"
                    >
                      <User className="h-3.5 w-3.5 mr-1" />
                      Masuk / Daftar
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-sm font-medium text-brown hover:bg-rose-soft hover:text-rose transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-2">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      const catalog = document.getElementById("catalog");
                      catalog?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <PhoneCall className="h-4 w-4 mr-1 text-rose-soft" />
                    Order Now (Katalog Kue)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        onBrowseCatalog={() => {
          const catalog = document.getElementById("catalog");
          catalog?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </>
  );
}
