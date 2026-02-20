// components/LogoutButton.tsx
"use client";

import React from "react";

export default function LogoutButton() {
    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        // Force a full reload to clear any server‑side state
        window.location.reload();
    };

    return (
        <button
            onClick={handleLogout}
            className="ml-4 rounded bg-slate-800 px-3 py-1 text-sm text-white hover:bg-slate-700"
        >
            Log out
        </button>
    );
}
