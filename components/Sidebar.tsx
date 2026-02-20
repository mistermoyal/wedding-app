"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Store,
    Settings,
    DatabaseBackup
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function Sidebar() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = () => {
            fetch("/api/settings")
                .then(res => res.json())
                .then(data => setSettings(data));
        };

        fetchSettings();

        // Listen for internal "settingsUpdated" events for better UX
        window.addEventListener("settingsUpdated", fetchSettings);
        return () => window.removeEventListener("settingsUpdated", fetchSettings);
    }, []);

    const navItems = [
        { label: "Tableau de bord", href: "/", icon: LayoutDashboard },
        { label: "Prestataires", href: "/vendors", icon: Store },
        { label: "Paiements", href: "/payments", icon: CreditCard },
        { label: "Invités", href: "/guests", icon: Users },
        { label: "Paramètres", href: "/settings", icon: Settings },
    ];

    const weddingDate = settings?.weddingDate ? new Date(settings.weddingDate) : null;
    const brideName = settings?.brideName || "Eve";
    const groomName = settings?.groomName || "Tom";

    return (
        <aside className="w-64 border-r bg-white flex flex-col h-screen sticky top-0">
            <div className="p-6 border-bottom">
                <h1 className="text-xl font-bold text-slate-900">{brideName} & {groomName} ❤️</h1>
                <p className="text-xs text-slate-500 uppercase tracking-tight">
                    {weddingDate ? format(weddingDate, "d MMMM yyyy", { locale: fr }) : "9 août 2026"}
                </p>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t">
                <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Sauvegardes</p>
                    <div className="space-y-2">
                        <Link href="/settings#backup-section" className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 w-full transition-colors">
                            <DatabaseBackup className="w-3 h-3" />
                            Gérer les sauvegardes
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    );
}
