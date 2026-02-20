import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await req.json();
        console.log(`[PATCH] Vendor ${id} update attempt:`, data);

        // More robust validation: check if required fields are provided (even if 0)
        if (data.vendorId === undefined || data.amount === undefined) {
            return NextResponse.json({ error: "Missing required fields (vendorId or amount)" }, { status: 400 });
        }

        // Parse date as UTC midnight to avoid timezone shifts
        let date = null;
        if (data.date) {
            const dateStr = data.date.includes('T') ? data.date.split('T')[0] : data.date;
            date = new Date(`${dateStr}T00:00:00Z`);
        }

        if (date && isNaN(date.getTime())) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        const payment = await prisma.payment.update({
            where: { id: id },
            data: {
                vendorId: data.vendorId,
                amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
                payer: data.payer,
                method: data.method,
                date: date,
                memo: data.memo,
                hasReceipt: !!data.hasReceipt,
            },
        });
        return NextResponse.json(payment);
    } catch (error: any) {
        console.error("PATCH error details:", error);
        // Provide more context in the error response for debugging
        return NextResponse.json({
            error: "Failed to update payment",
            details: error.message,
            code: error.code,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.payment.delete({
            where: { id: id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 });
    }
}
