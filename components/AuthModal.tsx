"use client";

import * as React from "react";
import { X, Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "signin" | "signup";
  onSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialTab = "signin",
  onSuccess,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = React.useState<"signin" | "signup">(initialTab);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const [prevIsOpen, setPrevIsOpen] = React.useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveTab(initialTab);
      setError(null);
    }
  }

  const handleResetAndClose = React.useCallback(() => {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
    setIsLoading(false);
    onClose();
    onSuccess?.();
  }, [onClose, onSuccess]);

  // Escape key listener & body scroll lock
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleResetAndClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleResetAndClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeTab === "signin") {
        const { error: signInError } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(
            signInError.message ||
              "Gagal masuk. Periksa kembali email dan kata sandi Anda."
          );
          setIsLoading(false);
          return;
        }

        handleResetAndClose();
      } else {
        if (!name.trim()) {
          setError("Silakan masukkan nama lengkap Anda.");
          setIsLoading(false);
          return;
        }

        const { error: signUpError } = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
        });

        if (signUpError) {
          setError(
            signUpError.message ||
              "Gagal mendaftar akun baru. Silakan coba lagi."
          );
          setIsLoading(false);
          return;
        }

        handleResetAndClose();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan jaringan atau server.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brown/50 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={handleResetAndClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div className="relative z-50 w-full max-w-md rounded-3xl bg-[#FAF4EB] border border-rose-border p-6 sm:p-8 text-brown shadow-2xl transition-all duration-200 animate-in fade-in-0 zoom-in-95">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute right-4 top-4 rounded-full p-2 text-brown hover:bg-rose-soft hover:text-rose transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose cursor-pointer"
          aria-label="Tutup jendela autentikasi"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-rose-soft border border-rose-border flex items-center justify-center text-rose mb-3">
            <span className="font-serif font-black text-xl text-rose">S</span>
          </div>
          <h2
            id="auth-modal-title"
            className="text-2xl font-serif font-bold text-brown"
          >
            {activeTab === "signin" ? "Masuk ke Akun" : "Daftar Akun Baru"}
          </h2>
          <p className="text-xs sm:text-sm text-brown-light mt-1">
            {activeTab === "signin"
              ? "Akses riwayat pesanan dan kemudahan pemesanan Anda."
              : "Bergabung bersama Sugar Bliss untuk pengalaman terbaik."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          role="tablist"
          className="grid grid-cols-2 p-1 mb-6 rounded-2xl bg-rose-soft/70 border border-rose-border"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "signin"}
            onClick={() => {
              setActiveTab("signin");
              setError(null);
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "signin"
                ? "bg-white text-brown shadow-xs"
                : "text-brown-light hover:text-brown"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "signup"}
            onClick={() => {
              setActiveTab("signup");
              setError(null);
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "signup"
                ? "bg-white text-brown shadow-xs"
                : "text-brown-light hover:text-brown"
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in-0">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "signup" && (
            <div>
              <label
                htmlFor="auth-name"
                className="block text-xs font-semibold text-brown mb-1.5"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brown-light">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="auth-name"
                  type="text"
                  required
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Amanda Putri"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-rose-border bg-white text-brown text-sm placeholder:text-brown-light/60 focus:outline-none focus:ring-2 focus:ring-rose disabled:opacity-60"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-semibold text-brown mb-1.5"
            >
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brown-light">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="auth-email"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-rose-border bg-white text-brown text-sm placeholder:text-brown-light/60 focus:outline-none focus:ring-2 focus:ring-rose disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold text-brown mb-1.5"
            >
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brown-light">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="auth-password"
                type="password"
                required
                minLength={8}
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-rose-border bg-white text-brown text-sm placeholder:text-brown-light/60 focus:outline-none focus:ring-2 focus:ring-rose disabled:opacity-60"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="rose"
            size="lg"
            disabled={isLoading}
            className="w-full font-bold shadow-md hover:shadow-lg transition-all cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {activeTab === "signin" ? "Memproses Masuk..." : "Mendaftarkan Akun..."}
              </>
            ) : activeTab === "signin" ? (
              "Masuk ke Akun"
            ) : (
              "Daftar Akun Baru"
            )}
          </Button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-5 text-center text-xs text-brown-light">
          {activeTab === "signin" ? (
            <p>
              Belum memiliki akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signup");
                  setError(null);
                }}
                className="font-bold text-rose hover:underline cursor-pointer"
              >
                Daftar sekarang
              </button>
            </p>
          ) : (
            <p>
              Sudah memiliki akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signin");
                  setError(null);
                }}
                className="font-bold text-rose hover:underline cursor-pointer"
              >
                Masuk di sini
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
