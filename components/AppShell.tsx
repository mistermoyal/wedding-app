// components/AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { CurrencyRateDisplay } from "@/components/CurrencyRateDisplay";
import LogoutButton from "@/components/LogoutButton";
import { CurrencyProvider } from "@/context/CurrencyContext";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isLoginRoute = pathname === "/login" || pathname.startsWith("/login/");

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <CurrencyProvider>
      <div className="flex min-h-screen border-collapse">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-6 border-b bg-white/50 px-8 backdrop-blur-md">
            <CurrencyRateDisplay />
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Devise
              </span>
              <CurrencyToggle />
              <LogoutButton />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
            {children}
          </main>
        </div>
      </div>
    </CurrencyProvider>
  );
}
