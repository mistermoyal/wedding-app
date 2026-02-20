"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { Badge } from "@/components/ui/badge";

export function CurrencyRateDisplay() {
    const { currency, rate } = useCurrency();

    if (currency !== "EUR") return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50/50 rounded-full border border-blue-100/50 transition-all animate-in fade-in slide-in-from-top-1 duration-500">
            <span className="text-[10px] font-bold text-blue-600/70 uppercase tracking-tighter">Taux actif</span>
            <span className="text-xs font-black text-blue-700">1 ₪ = {rate} €</span>
        </div>
    );
}
