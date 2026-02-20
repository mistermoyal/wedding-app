"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Currency = "ILS" | "EUR";

interface CurrencyContextType {
    currency: Currency;
    rate: number;
    setCurrency: (c: Currency) => void;
    setRate: (r: number) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>("ILS");
    const [rate, setRate] = useState<number>(0.25);

    useEffect(() => {
        // Load persistend currency choice
        const savedCurrency = localStorage.getItem("wedding_currency") as Currency;
        if (savedCurrency === "ILS" || savedCurrency === "EUR") {
            setCurrencyState(savedCurrency);
        }

        const fetchRate = () => {
            // Fetch official rate from settings
            fetch("/api/settings")
                .then(res => res.json())
                .then(data => {
                    if (data.rateIlsToEur) {
                        setRate(data.rateIlsToEur);
                    }
                })
                .catch(err => console.error("Failed to fetch currency rate", err));
        };

        fetchRate();

        window.addEventListener("settingsUpdated", fetchRate);
        return () => window.removeEventListener("settingsUpdated", fetchRate);
    }, []);

    const setCurrency = (c: Currency) => {
        setCurrencyState(c);
        localStorage.setItem("wedding_currency", c);
    };

    return (
        <CurrencyContext.Provider value={{ currency, rate, setCurrency, setRate }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
}
