"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { cn } from "@/lib/utils";

export function CurrencyToggle() {
    const { currency, setCurrency } = useCurrency();

    return (
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
            <button
                onClick={() => setCurrency("ILS")}
                className={cn(
                    "px-3 py-1 text-xs font-bold rounded-md transition-all",
                    currency === "ILS"
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
            >
                ₪
            </button>
            <button
                onClick={() => setCurrency("EUR")}
                className={cn(
                    "px-3 py-1 text-xs font-bold rounded-md transition-all",
                    currency === "EUR"
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
            >
                €
            </button>
        </div>
    );
}
