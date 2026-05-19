import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#E6D9AA]/20 text-[#711610]">
      <header className="border-b border-[#9A999D]/40 bg-white/90">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Image src="/uni.png" alt="Logo UNI" width={44} height={44} className="h-11 w-11 object-contain" priority />
            <p className="text-base font-semibold md:text-lg">Inscripciones 2026-1</p>
          </div>
          <Link
            href="/my-profile"
            className="rounded-md bg-[#711610] px-4 py-2 text-sm font-medium text-white hover:bg-[#5e120d]"
          >
            Mi perfil
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1">{children}</main>

      <footer className="border-t border-[#9A999D]/30 bg-white/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-3 text-xs text-[#9A999D] md:px-6">
          Universidad Nacional de Ingenieria - Proceso de inscripciones
        </div>
      </footer>
    </div>
  );
}
