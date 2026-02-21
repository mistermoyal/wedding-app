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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const vendor = await prisma.vendor.findUnique({
            where: { id },
            include: { payments: true },
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
        const vendor = await prisma.vendor.update({
            where: { id },
            data: {
                name: data.name,
                category: data.category,
                estimatedTotal: data.estimatedTotal,
                totalAmount: data.totalAmount,
                estimation: ((data as any).estimation === "" || (data as any).estimation === undefined) ? null : parseFloat((data as any).estimation),
                additionalFees: (data as any).additionalFees === "" ? 0 : parseFloat((data as any).additionalFees || "0"),
                pricingModel: data.pricingModel,
                pricePerGuest: data.pricePerGuest,
                fixedGuestCountTom: parseNullableInt(data.fixedGuestCountTom),
                fixedGuestCountEve: parseNullableInt(data.fixedGuestCountEve),
                includeChildren: data.includeChildren,
                guestCountBasis: data.guestCountBasis,
                paymentResponsibility: data.paymentResponsibility,
                customTomPercentage: data.customTomPercentage,
                customEvePercentage: data.customEvePercentage,
                allocationMode: data.allocationMode,
                remainingResponsibility: data.remainingResponsibility,
                customRemainingTomPercentage: data.customRemainingTomPercentage,
                customRemainingEvePercentage: data.customRemainingEvePercentage,
                notes: data.notes,
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
