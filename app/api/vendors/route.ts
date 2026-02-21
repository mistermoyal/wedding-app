import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
                estimatedTotal: data.estimatedTotal || 0,
                totalAmount: data.totalAmount || 0,
                estimation: ((data as any).estimation === "" || (data as any).estimation === undefined) ? null : parseFloat((data as any).estimation),
                additionalFees: (data as any).additionalFees === "" ? 0 : parseFloat((data as any).additionalFees || "0"),
                pricingModel: data.pricingModel || "FIXED",
                pricePerGuest: data.pricePerGuest,
                fixedGuestCountTom: data.fixedGuestCountTom,
                fixedGuestCountEve: data.fixedGuestCountEve,
                includeChildren: data.includeChildren || false,
                guestCountBasis: data.guestCountBasis || "INVITED",
                paymentResponsibility: data.paymentResponsibility || "SPLIT_50_50",
                customTomPercentage: data.customTomPercentage,
                customEvePercentage: data.customEvePercentage,
                allocationMode: data.allocationMode || "TOTAL_STANDARD",
                remainingResponsibility: data.remainingResponsibility || "SPLIT_50_50",
                customRemainingTomPercentage: data.customRemainingTomPercentage,
                customRemainingEvePercentage: data.customRemainingEvePercentage,
                notes: data.notes,
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
