import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const vendorId = searchParams.get("vendorId");
        const payer = searchParams.get("payer");

        const where: any = {};
        if (vendorId) where.vendorId = vendorId;
        if (payer) where.payer = payer;

        const payments = await prisma.payment.findMany({
            where,
            include: { vendor: true },
            orderBy: { date: "desc" },
        });
        return NextResponse.json(payments);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const payment = await prisma.payment.create({
            data: {
                vendorId: data.vendorId,
                amount: data.amount,
                payer: data.payer,
                method: data.method,
                date: data.date ? new Date(`${data.date.split('T')[0]}T00:00:00Z`) : new Date(),
                memo: data.memo,
                hasReceipt: data.hasReceipt || false,
            },
        });
        return NextResponse.json(payment);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
    }
}
