import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const parseNullableInt = (value: unknown) => {
    if (value === "" || value === null || value === undefined) return null;
    if (typeof value === "number") return Number.isNaN(value) ? null : value;
    if (typeof value === "string") {
        const parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
};

const parseFloatOr = (value: unknown, fallback: number) => {
    if (value === "" || value === null || value === undefined) return fallback;
    if (typeof value === "number") return Number.isNaN(value) ? fallback : value;
    if (typeof value === "string") {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
};

const parseNullableFloat = (value: unknown) => {
    if (value === "" || value === null || value === undefined) return null;
    if (typeof value === "number") return Number.isNaN(value) ? null : value;
    if (typeof value === "string") {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
};

export async function GET() {
    try {
        const vendors = await prisma.vendor.findMany({
            include: { payments: true },
            orderBy: { totalAmount: "desc" },
        });
        return NextResponse.json(vendors);
    } catch (error) {
        console.error("Failed to fetch vendors:", error);
        return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const vendor = await prisma.vendor.create({
            data: {
                name: data.name,
                category: data.category,
                estimatedTotal: parseFloatOr(data.estimatedTotal, 0),
                totalAmount: parseFloatOr(data.totalAmount, 0),
                estimation: parseNullableFloat((data as any).estimation),
                additionalFees: parseFloatOr((data as any).additionalFees, 0),
                pricingModel: data.pricingModel || "FIXED",
                pricePerGuest: parseFloatOr(data.pricePerGuest, 0),
                fixedGuestCountTom: parseNullableInt(data.fixedGuestCountTom),
                fixedGuestCountEve: parseNullableInt(data.fixedGuestCountEve),
                includeChildren: data.includeChildren || false,
                guestCountBasis: data.guestCountBasis || "INVITED",
                paymentResponsibility: data.paymentResponsibility || "SPLIT_50_50",
                customTomPercentage: parseNullableFloat(data.customTomPercentage),
                customEvePercentage: parseNullableFloat(data.customEvePercentage),
                allocationMode: data.allocationMode || "TOTAL_STANDARD",
                remainingResponsibility: data.remainingResponsibility || "SPLIT_50_50",
                customRemainingTomPercentage: parseNullableFloat(data.customRemainingTomPercentage),
                customRemainingEvePercentage: parseNullableFloat(data.customRemainingEvePercentage),
                notes: data.notes,
                contractUrl: data.contractUrl || null,
                contractName: data.contractName || null,
            },
        });
        return NextResponse.json(vendor);
    } catch (error) {
        console.error("Failed to create vendor:", error);
        return NextResponse.json(
            { error: "Failed to create vendor", details: String(error) },
            { status: 500 }
        );
    }
}
