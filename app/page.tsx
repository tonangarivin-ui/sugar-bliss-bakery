"use client";

import * as React from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Flame,
  Award,
  Heart,
  Truck,
  Coffee,
  Check,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CartModal, CartItem, formatIDR } from "@/components/CartModal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  badge: string;
  portion: string;
  highlights: string[];
}

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}

const PRODUCT_METADATA: Record<
  string,
  { badge: string; portion: string; highlights: string[] }
> = {
  "classic-cakes": {
    badge: "Bestseller",
    portion: "Diameter 18 cm (Porsi 6-8 Orang)",
    highlights: ["Earl Grey Infused", "French Butter Cream", "Less Sugar Recipe"],
  },
  "decadent-desserts": {
    badge: "Fresh Baked Daily",
    portion: "Box Cantik Isi 4 Varian",
    highlights: ["4 Varian Rasa Berbeda", "Belgian Chocolate 70%", "Tekstur Moist Sempurna"],
  },
  "custom-creations": {
    badge: "Kustom Eksklusif",
    portion: "Diameter 20 cm + Desain Custom",
    highlights: ["Bebas Pilih Desain", "Kartu Ucapan & Lilin", "Pre-Order H-2"],
  },
  "artisan-latte": {
    badge: "Best Sweet Pairing",
    portion: "Cup 250 ml (Hot / Iced)",
    highlights: ["Biji Single-Origin", "Pilihan Susu Oat / Fresh Milk", "Less Bitter Finish"],
  },
};

function mapApiToProduct(p: ApiProduct): Product {
  const meta = PRODUCT_METADATA[p.id] || PRODUCT_METADATA[p.slug] || {
    badge: "Fresh Baked",
    portion: "Porsi Spesial",
    highlights: ["Bahan Alami Pilihan", "Resep Artisan", "Panggang Setiap Hari"],
  };

  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    image: p.imageUrl || "/cake.png",
    description: p.description || "",
    badge: meta.badge,
    portion: meta.portion,
    highlights: meta.highlights,
  };
}

const PRODUCTS: Product[] = [
  {
    id: "classic-cakes",
    name: "Classic Cakes",
    category: "Signature Cakes",
    price: 285000,
    image: "/cake.png",
    description:
      "Sponge chiffon Earl Grey aromatik berlapis krim susu lembut, selai berry liar homemade, dan hiasan kelopak edible pilihan.",
    badge: "Bestseller",
    portion: "Diameter 18 cm (Porsi 6-8 Orang)",
    highlights: ["Earl Grey Infused", "French Butter Cream", "Less Sugar Recipe"],
  },
  {
    id: "decadent-desserts",
    name: "Decadent Desserts",
    category: "Cupcake & Mousse Box",
    price: 165000,
    image: "/cupcake.png",
    description:
      "Koleksi 4 cupcake istimewa: Belgian Dark Chocolate Ganache, Salted Caramel Cream, Velvet Berry, dan Pistachio Rose.",
    badge: "Fresh Baked Daily",
    portion: "Box Cantik Isi 4 Varian",
    highlights: ["4 Varian Rasa Berbeda", "Belgian Chocolate 70%", "Tekstur Moist Sempurna"],
  },
  {
    id: "custom-creations",
    name: "Custom Creations",
    category: "Celebration Cake",
    price: 380000,
    image: "/cake.png",
    description:
      "Kue perayaan personal berdesain estetik dengan pilihan rasa vanila Madagaskar atau cokelat Belgia, lengkap dengan topper kustom.",
    badge: "Kustom Eksklusif",
    portion: "Diameter 20 cm + Desain Custom",
    highlights: ["Bebas Pilih Desain", "Kartu Ucapan & Lilin", "Pre-Order H-2"],
  },
];

const COFFEE_PRODUCT: Product = {
  id: "artisan-latte",
  name: "Artisan Hazelnut Velvet Latte",
  category: "Artisan Coffee",
  price: 38000,
  image: "/latte.png",
  description:
    "Espresso biji Flores Bajawa berpadu susu oat gurih dan sirup hazelnut panggang. Pendamping terbaik untuk kue manis Anda.",
  badge: "Best Sweet Pairing",
  portion: "Cup 250 ml (Hot / Iced)",
  highlights: ["Biji Single-Origin", "Pilihan Susu Oat / Fresh Milk", "Less Bitter Finish"],
};

export default function Home() {
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Dynamic products from API with initial fallback
  const [cakeProducts, setCakeProducts] = React.useState<Product[]>(PRODUCTS);
  const [coffeeProduct, setCoffeeProduct] = React.useState<Product>(COFFEE_PRODUCT);

  React.useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Gagal mengambil data produk dari server");
        }
        const data: ApiProduct[] = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const coffeeItem = data.find(
            (item) =>
              item.category.toLowerCase().includes("coffee") ||
              item.id === "artisan-latte"
          );
          const cakeItems = data.filter(
            (item) =>
              !item.category.toLowerCase().includes("coffee") &&
              item.id !== "artisan-latte"
          );

          if (cakeItems.length > 0) {
            setCakeProducts(cakeItems.map(mapApiToProduct));
          }
          if (coffeeItem) {
            setCoffeeProduct(mapApiToProduct(coffeeItem));
          }
        }
      } catch (err) {
        console.warn("Menggunakan produk fallback bawaan:", err);
      }
    }

    void loadProducts();
  }, []);

  // Cart helper functions
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.image,
          quantity: 1,
          portion: product.portion,
        },
      ];
    });

    // Show temporary toast feedback
    setToastMessage(`"${product.name}" ditambahkan ke keranjang.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF4EB] text-brown flex flex-col selection:bg-rose-soft selection:text-rose">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          <div className="bg-brown text-[#FAF4EB] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-rose-border">
            <Check className="h-5 w-5 text-rose-soft shrink-0" />
            <p className="text-sm font-medium">{toastMessage}</p>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="text-xs font-bold text-rose-soft underline ml-2 hover:text-white cursor-pointer"
            >
              Lihat Keranjang
            </button>
          </div>
        </div>
      )}

      {/* Header / Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Cart Modal / Drawer */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================= */}
        <section
          id="hero"
          className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden"
        >
          {/* Subtle warm decorative background aura */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-rose-soft/40 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Text & CTAs */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-soft border border-rose-border text-brown text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose inline-block" />
                  <span>Artisanal Bakery di Senopati, Jakarta</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-brown tracking-tight leading-[1.15]">
                  Life is Better with Something Sweet
                </h1>

                <p className="text-base sm:text-lg text-brown-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Setiap gigitan adalah kebahagiaan murni. Kami memanggang aneka kue lembut, cupcake artisan, dan hidangan penutup istimewa setiap pagi menggunakan mentega murni Prancis dan bahan alami pilihan terbaik.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full sm:w-auto shadow-md"
                    onClick={() => {
                      const catalog = document.getElementById("catalog");
                      catalog?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <ShoppingBag className="h-5 w-5 text-rose-soft mr-1" />
                    Pesan Fresh Bakes Sekarang
                  </Button>
                  <Button
                    variant="outline-rose"
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      const coffee = document.getElementById("coffee");
                      coffee?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <Coffee className="h-5 w-5 mr-1" />
                    Lihat Coffee Pairing
                  </Button>
                </div>

                {/* Social proof trust badge */}
                <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-brown-light">
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-600">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="font-bold text-brown">4.9 / 5.0</span>
                    <span>(1.200+ ulasan penikmat kue)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Image (cupcake.png) */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md">
                  {/* Decorative Frame */}
                  <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                    <Image
                      src="/cupcake.png"
                      alt="Signature Red Velvet Cupcake Sugar Bliss Bakery"
                      fill
                      priority
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 450px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brown/40 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-rose-border/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-rose font-bold block">
                          Daily Highlight
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-brown">
                          Signature Red Velvet Cupcake
                        </p>
                      </div>
                      <Badge variant="rose" className="text-[11px]">
                        Oven 07:00 WIB
                      </Badge>
                    </div>
                  </div>

                  {/* Floating decorative badge */}
                  <div className="absolute -top-4 -right-4 bg-rose text-white px-3.5 py-2 rounded-2xl shadow-lg border-2 border-white text-xs font-bold flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 fill-current" />
                    <span>Pure French Butter</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FEATURES STRIP */}
        {/* ========================================================= */}
        <section
          id="features"
          className="py-10 bg-white border-y border-rose-border/60"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF4EB]/60 border border-rose-border/40">
                <div className="h-11 w-11 rounded-xl bg-rose-soft border border-rose-border flex items-center justify-center text-rose shrink-0">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-brown text-base">
                    Freshly Baked
                  </h3>
                  <p className="text-xs text-brown-light mt-1 leading-relaxed">
                    Dipanggang setiap pagi tanpa bahan pengawet buatan untuk kesegaran rasa maksimal.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF4EB]/60 border border-rose-border/40">
                <div className="h-11 w-11 rounded-xl bg-rose-soft border border-rose-border flex items-center justify-center text-rose shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-brown text-base">
                    Premium Ingredients
                  </h3>
                  <p className="text-xs text-brown-light mt-1 leading-relaxed">
                    Mentega Prancis murni, cokelat Belgia 70%, dan ekstrak vanila Madagaskar asli.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF4EB]/60 border border-rose-border/40">
                <div className="h-11 w-11 rounded-xl bg-rose-soft border border-rose-border flex items-center justify-center text-rose shrink-0">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-brown text-base">
                    Artisan Craftsmanship
                  </h3>
                  <p className="text-xs text-brown-light mt-1 leading-relaxed">
                    Didekorasi manual dengan teliti oleh pastry chef profesional untuk setiap pesanan.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF4EB]/60 border border-rose-border/40">
                <div className="h-11 w-11 rounded-xl bg-rose-soft border border-rose-border flex items-center justify-center text-rose shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-brown text-base">
                    Same-Day Delivery
                  </h3>
                  <p className="text-xs text-brown-light mt-1 leading-relaxed">
                    Pengiriman instan aman dan higienis dengan box kokoh untuk area Jabodetabek.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PRODUCT CATALOG (3 CARDS REQUIRED) */}
        {/* ========================================================= */}
        <section id="catalog" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
              <Badge variant="rose" className="text-xs py-1 px-3.5">
                Katalog Menu Favorit
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brown tracking-tight">
                Koleksi Kue & Hidangan Penutup Kami
              </h2>
              <p className="text-sm sm:text-base text-brown-light leading-relaxed">
                Pilih kreasi manis favorit Anda untuk dinikmati bersama keluarga, hadiah orang tercinta, atau perayaan istimewa.
              </p>
            </div>

            {/* 3 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cakeProducts.map((product) => (
                <Card
                  key={product.id}
                  className="flex flex-col overflow-hidden border border-rose-border/70 group"
                >
                  {/* Card Image */}
                  <div className="relative aspect-4/3 w-full bg-rose-soft overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 380px"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="rose" className="text-xs font-semibold shadow-xs">
                        {product.badge}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/95 text-brown text-xs font-bold px-2.5 py-1 rounded-full shadow-xs border border-rose-border/50">
                        {product.portion}
                      </span>
                    </div>
                  </div>

                  {/* Card Header & Content */}
                  <CardHeader className="pb-3">
                    <div className="text-xs uppercase tracking-wider text-rose font-bold mb-1">
                      {product.category}
                    </div>
                    <CardTitle className="text-2xl group-hover:text-rose transition-colors">
                      {product.name}
                    </CardTitle>
                    <div className="text-2xl font-serif font-bold text-brown pt-1">
                      {formatIDR(product.price)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1">
                    <CardDescription className="text-sm text-brown leading-relaxed">
                      {product.description}
                    </CardDescription>

                    {/* Highlights bullet list */}
                    <div className="space-y-1.5 pt-2 border-t border-rose-border/40">
                      {product.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-brown-light">
                          <Check className="h-3.5 w-3.5 text-rose shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  {/* Card Footer: Add to Cart button */}
                  <CardFooter className="pt-2 pb-6">
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full font-bold shadow-xs hover:bg-rose hover:text-white transition-colors"
                      onClick={() => handleAddToCart(product)}
                    >
                      <Plus className="h-4 w-4 mr-1 text-rose-soft" />
                      Tambah ke Keranjang
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Custom order banner note */}
            <div className="mt-12 p-6 rounded-3xl bg-rose-soft/70 border border-rose-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <h4 className="font-serif font-bold text-lg text-brown">
                  Punya Kebutuhan Kue Pernikahan atau Hampers Khusus?
                </h4>
                <p className="text-xs sm:text-sm text-brown-light mt-0.5">
                  Konsultasikan tema warna, tulisan kartu, atau pesanan jumlah besar dengan tim pastry kami melalui WhatsApp.
                </p>
              </div>
              <Button
                variant="rose"
                size="default"
                className="shrink-0"
                onClick={() => {
                  const url = `https://wa.me/6281234567890?text=${encodeURIComponent(
                    "Halo Sugar Bliss Bakery! Saya ingin konsultasi pesanan custom cake / hampers acara."
                  )}`;
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
              >
                Konsultasi Custom Order
              </Button>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* COFFEE PAIRING SECTION */}
        {/* ========================================================= */}
        <section
          id="coffee"
          className="py-16 sm:py-24 bg-white border-y border-rose-border/60 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Image (latte.png) */}
              <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
                <div className="relative w-full max-w-md">
                  <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FAF4EB] bg-[#FAF4EB]">
                    <Image
                      src={COFFEE_PRODUCT.image}
                      alt="Artisan Latte Sugar Bliss Bakery"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 450px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brown/30 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-4 left-4">
                      <Badge variant="rose" className="text-xs shadow-xs">
                        Single Origin Brew
                      </Badge>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-rose-border/60 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-brown">
                          {COFFEE_PRODUCT.name}
                        </p>
                        <p className="text-[11px] text-rose font-semibold">
                          {formatIDR(COFFEE_PRODUCT.price)}
                        </p>
                      </div>
                      <span className="text-[10px] text-brown-light font-medium">
                        Hot or Iced
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Artisan Coffee Description & CTA */}
              <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-soft border border-rose-border text-brown text-xs font-semibold">
                  <Coffee className="h-3.5 w-3.5 text-rose" />
                  <span>Coffee Pairing Experience</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brown tracking-tight leading-tight">
                  Kopi Artisan Pendamping Manis yang Sempurna
                </h2>

                <p className="text-base text-brown-light leading-relaxed">
                  Kenikmatan hidangan penutup terasa semakin utuh bersama secangkir kopi artisan yang diseduh dengan presisi. Kami memadukan biji kopi single-origin Flores Bajawa dan Aceh Gayo dengan profil rasa cokelat lembut dan keasaman seimbang untuk menyempurnakan rasa manis dan gurihnya butter pastry kami.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#FAF4EB] border border-rose-border/60">
                    <h4 className="font-serif font-bold text-brown text-sm">
                      Biji Kopi Pilihan
                    </h4>
                    <p className="text-xs text-brown-light mt-1">
                      100% Arabika lokal dengan notes hazelnut dan cocoa nibs yang menenangkan.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF4EB] border border-rose-border/60">
                    <h4 className="font-serif font-bold text-brown text-sm">
                      Pilihan Susu Premium
                    </h4>
                    <p className="text-xs text-brown-light mt-1">
                      Tersedia susu murni pasteurisasi, Oatly oat milk, dan almond milk tanpa gula tambahan.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                  <Button
                    variant="rose"
                    size="lg"
                    className="w-full sm:w-auto shadow-md"
                    onClick={() => handleAddToCart(coffeeProduct)}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Pesan Latte Pairing ({formatIDR(coffeeProduct.price)})
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      const catalog = document.getElementById("catalog");
                      catalog?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Discover Coffee & Cakes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ABOUT & STORY SECTION */}
        {/* ========================================================= */}
        <section id="about" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-brown text-[#FAF4EB] p-8 sm:p-14 relative overflow-hidden shadow-2xl">
              <div className="max-w-2xl space-y-5">
                <Badge variant="rose" className="text-xs text-white">
                  Cerita Sugar Bliss
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#FAF4EB] tracking-tight">
                  Dibuat dengan Ketulusan, Dipanggang Sepenuh Hati
                </h2>
                <p className="text-sm sm:text-base text-rose-soft/90 leading-relaxed">
                  Bermula dari dapur kecil di Senopati pada tahun 2021, Sugar Bliss didirikan dengan satu keyakinan sederhana: bahwa sepotong kue hangat mampu mengubah hari yang melelahkan menjadi momen penuh senyuman.
                </p>
                <p className="text-sm sm:text-base text-rose-soft/90 leading-relaxed">
                  Kami menolak kompromi dalam hal bahan baku. Semua resep kami dibuat dengan mentega murni tanpa campuran minyak kelapa sawit olahan, pemanis secukupnya agar rasa asli bahan tetap bersinar, dan dipanggang segar di pagi hari saat aroma harum memenuhi jalanan Senopati.
                </p>
                <div className="pt-4 flex flex-wrap gap-6 text-xs text-rose-soft">
                  <div>
                    <span className="block text-2xl font-serif font-bold text-white">100%</span>
                    <span>Halal & Higienis</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-serif font-bold text-white">0%</span>
                    <span>Pengawet Kimia</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-serif font-bold text-white">Fresh</span>
                    <span>Panggang Setiap Hari</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* FOOTER 4 KOLOM */}
      {/* ========================================================= */}
      <footer id="contact" className="bg-[#FAF4EB] border-t border-rose-border/70 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-rose-border/60">
            {/* Kolom 1: Brand & Filosofi */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-rose-soft border border-rose-border flex items-center justify-center text-rose shadow-xs">
                  <span className="font-serif font-black text-xl text-rose">S</span>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-brown">
                    Sugar Bliss
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest text-rose font-medium block">
                    Artisan Bakery & Cafe
                  </span>
                </div>
              </div>
              <p className="text-xs text-brown-light leading-relaxed">
                Toko roti artisan penyedia aneka cake lembut, dessert box istimewa, dan kopi artisan pilihan di Jakarta Selatan. Menemani setiap perayaan manis Anda sejak 2021.
              </p>
              <div className="flex items-center gap-3 pt-1 text-brown">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-rose-soft border border-rose-border flex items-center justify-center text-brown hover:text-rose hover:bg-white transition-colors"
                  aria-label="Instagram Sugar Bliss"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-rose-soft border border-rose-border flex items-center justify-center text-brown hover:text-rose hover:bg-white transition-colors"
                  aria-label="WhatsApp Sugar Bliss"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href="mailto:order@sugarbliss.id"
                  className="h-9 w-9 rounded-full bg-rose-soft border border-rose-border flex items-center justify-center text-brown hover:text-rose hover:bg-white transition-colors"
                  aria-label="Email Sugar Bliss"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Kolom 2: Menu & Kategori */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-base text-brown">
                Koleksi Menu
              </h4>
              <ul className="space-y-2 text-xs text-brown-light">
                <li>
                  <a
                    href="#catalog"
                    className="hover:text-rose transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="h-3 w-3 text-rose" />
                    Classic Cakes & Chiffon
                  </a>
                </li>
                <li>
                  <a
                    href="#catalog"
                    className="hover:text-rose transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="h-3 w-3 text-rose" />
                    Decadent Desserts Box
                  </a>
                </li>
                <li>
                  <a
                    href="#catalog"
                    className="hover:text-rose transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="h-3 w-3 text-rose" />
                    Custom Celebration Cake
                  </a>
                </li>
                <li>
                  <a
                    href="#coffee"
                    className="hover:text-rose transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="h-3 w-3 text-rose" />
                    Artisan Coffee Pairing
                  </a>
                </li>
                <li>
                  <a
                    href="#catalog"
                    className="hover:text-rose transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="h-3 w-3 text-rose" />
                    Seasonal Holiday Hampers
                  </a>
                </li>
              </ul>
            </div>

            {/* Kolom 3: Layanan & Informasi */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-base text-brown">
                Layanan & Bantuan
              </h4>
              <ul className="space-y-2 text-xs text-brown-light">
                <li>
                  <a
                    href="#features"
                    className="hover:text-rose transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="h-3 w-3 text-rose" />
                    Ketentuan Freshly Baked
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-rose transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="h-3 w-3 text-rose" />
                    Area Pengiriman Jabodetabek
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="hover:text-rose transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                  >
                    <ChevronRight className="h-3 w-3 text-rose" />
                    Panduan Checkout WhatsApp
                  </button>
                </li>
                <li>
                  <a
                    href="#about"
                    className="hover:text-rose transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="h-3 w-3 text-rose" />
                    Bahan Baku & Sertifikasi Halal
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-rose transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="h-3 w-3 text-rose" />
                    Fasilitas Dine-in & Cafe
                  </a>
                </li>
              </ul>
            </div>

            {/* Kolom 4: Outlet & Jam Buka */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-base text-brown">
                Kunjungi Outlet Kami
              </h4>
              <div className="space-y-2.5 text-xs text-brown-light">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-rose shrink-0 mt-0.5" />
                  <span>
                    Jl. Senopati Raya No. 45, Kebayoran Baru, Jakarta Selatan 12190
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-rose shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-brown">Buka Setiap Hari:</p>
                    <p>Senin - Minggu: 07.30 - 21.00 WIB</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-rose shrink-0 mt-0.5" />
                  <span>CS WhatsApp: +62 812-3456-7890</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brown-light">
            <p>
              © 2026 Sugar Bliss Bakery. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span>Freshly Handcrafted in Jakarta</span>
              <span>•</span>
              <a
                href="#hero"
                className="hover:text-rose transition-colors font-medium"
              >
                Kembali ke Atas ↑
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
