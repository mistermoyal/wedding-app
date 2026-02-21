import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const vendor = await prisma.vendor.findUnique({
            where: { id },
            include: { payments: true, attachments: true },
        });
        if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
        return NextResponse.json(vendor);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await req.json();
        const contractUrl = data.contractUrl === undefined ? undefined : data.contractUrl;
        const contractName = data.contractName === undefined ? undefined : data.contractName;
        const vendor = await prisma.vendor.update({
            where: { id },
            data: {
                name: data.name,
                category: data.category,
                estimatedTotal: parseFloatOr(data.estimatedTotal, 0),
                totalAmount: parseFloatOr(data.totalAmount, 0),
                estimation: parseNullableFloat((data as any).estimation),
                additionalFees: parseFloatOr((data as any).additionalFees, 0),
                pricingModel: data.pricingModel,
                pricePerGuest: parseFloatOr(data.pricePerGuest, 0),
                fixedGuestCountTom: parseNullableInt(data.fixedGuestCountTom),
                fixedGuestCountEve: parseNullableInt(data.fixedGuestCountEve),
                includeChildren: data.includeChildren,
                guestCountBasis: data.guestCountBasis,
                paymentResponsibility: data.paymentResponsibility,
                customTomPercentage: parseNullableFloat(data.customTomPercentage),
                customEvePercentage: parseNullableFloat(data.customEvePercentage),
                allocationMode: data.allocationMode,
                remainingResponsibility: data.remainingResponsibility,
                customRemainingTomPercentage: parseNullableFloat(data.customRemainingTomPercentage),
                customRemainingEvePercentage: parseNullableFloat(data.customRemainingEvePercentage),
                notes: data.notes,
                contractUrl,
                contractName,
            },
        });
        return NextResponse.json(vendor);
    } catch (error) {
        console.error("PRISMA ERROR:", error);
        return NextResponse.json({ error: "Failed to update vendor", details: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.vendor.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete vendor" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await req.json();
        const vendor = await prisma.vendor.update({
            where: { id },
            data: { status: data.status },
        });
        return NextResponse.json(vendor);
    } catch (error) {
        return NextResponse.json({ error: "Failed to patch vendor" }, { status: 500 });
    }
}
