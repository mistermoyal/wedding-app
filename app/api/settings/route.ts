import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
    try {
        let settings = await prisma.settings.findUnique({
            where: { id: "main" }
        });

        if (!settings) {
            // Create default settings if not exists
            settings = await prisma.settings.create({
                data: {
                    id: "main",
                    weddingDate: new Date("2026-08-09T00:00:00Z"),
                    groomName: "Tom",
                    brideName: "Eve"
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const settings = await prisma.settings.upsert({
            where: { id: "main" },
            update: {
                weddingDate: data.weddingDate ? new Date(data.weddingDate) : undefined,
                groomName: data.groomName,
                brideName: data.brideName,
                rateIlsToEur: data.rateIlsToEur !== undefined ? parseFloat(data.rateIlsToEur) : undefined,
            },
            create: {
                id: "main",
                weddingDate: data.weddingDate ? new Date(data.weddingDate) : new Date("2026-08-09T00:00:00Z"),
                groomName: data.groomName || "Tom",
                brideName: data.brideName || "Eve",
                rateIlsToEur: data.rateIlsToEur !== undefined ? parseFloat(data.rateIlsToEur) : 0.25,
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
