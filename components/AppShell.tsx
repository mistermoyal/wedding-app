// components/AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { CurrencyRateDisplay } from "@/components/CurrencyRateDisplay";
import LogoutButton from "@/components/LogoutButton";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
        <Sidebar className="hidden md:flex" />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-white/50 px-4 backdrop-blur-md sm:px-8 md:justify-end">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <Sidebar className="h-full w-full border-r-0" />
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex items-center gap-3">
              <CurrencyRateDisplay />
              <div className="hidden items-center gap-3 sm:flex">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Devise
                </span>
                <CurrencyToggle />
              </div>
              <LogoutButton />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </CurrencyProvider>
  );
}
