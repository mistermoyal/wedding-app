import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const vendors = await prisma.vendor.findMany({ include: { payments: true } });
        const guests = await prisma.guest.findMany();
        const settings = await prisma.settings.findUnique({ where: { id: "main" } });

        return NextResponse.json({
            vendors,
            guests,
            settings,
            exportDate: new Date().toISOString(),
            version: "1.0.0"
        });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
