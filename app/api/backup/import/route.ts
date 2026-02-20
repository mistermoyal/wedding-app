import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { vendors, guests, settings } = data;

        if (!vendors || !guests) {
            return NextResponse.json({ error: "Invalid backup file" }, { status: 400 });
        }

        // Use a transaction to clear and refill
        await prisma.$transaction(async (tx) => {
            // Delete everything
            await tx.payment.deleteMany();
            await tx.vendor.deleteMany();
            await tx.guest.deleteMany();
            await tx.settings.deleteMany();

            // Restore settings
            if (settings) {
                await tx.settings.create({
                    data: {
                        id: "main",
                        weddingDate: new Date(settings.weddingDate),
                        groomName: settings.groomName,
                        brideName: settings.brideName
                    }
                });
            }

            // Restore vendors and their payments
            for (const v of vendors) {
                const { payments, ...vendorData } = v;
                // Clean vendor data for prisma (remove id if it exists and we want to recreate it, 
                // but since we deleted all, keeping IDs from bridge is better for relationship integrity)
                const createdVendor = await tx.vendor.create({
                    data: {
                        ...vendorData,
                        createdAt: new Date(vendorData.createdAt),
                        updatedAt: new Date(vendorData.updatedAt),
                    }
                });

                if (payments && payments.length > 0) {
                    await tx.payment.createMany({
                        data: payments.map((p: any) => ({
                            ...p,
                            date: p.date ? new Date(p.date) : null,
                            createdAt: new Date(p.createdAt),
                            updatedAt: new Date(p.updatedAt),
                        }))
                    });
                }
            }

            // Restore guests
            for (const g of guests) {
                await tx.guest.create({
                    data: {
                        ...g,
                        createdAt: new Date(g.createdAt),
                        updatedAt: new Date(g.updatedAt),
                    }
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Import error:", error);
        return NextResponse.json({ error: "Import failed: " + (error as Error).message }, { status: 500 });
    }
}
