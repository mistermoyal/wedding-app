import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const side = searchParams.get("side");
        const guests = await prisma.guest.findMany({
            where: side ? { side } : {},
            orderBy: { name: "asc" },
        });
        return NextResponse.json(guests);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const guest = await prisma.guest.create({
            data: {
                name: data.name,
                side: data.side,
                saveTheDate: data.saveTheDate || false,
                invited: data.invited || false,
                rsvp: data.rsvp || "PENDING",
                numGuests: data.numGuests || 1,
                numChildren3to13: data.numChildren3to13 || 0,
                numChildren0to3: data.numChildren0to3 || 0,
                numAdultsPresent: data.numAdultsPresent || 0,
                numChildrenPresent: data.numChildrenPresent || 0,
                numChildren0to3Present: data.numChildren0to3Present || 0,
                numNotPresent: 0,
                numPresent: (data.numAdultsPresent || 0)
                    + (data.numChildrenPresent || 0)
                    + (data.numChildren0to3Present || 0),
                notes: data.notes,
            },
        });
        return NextResponse.json(guest);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create guest" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const data = await req.json();
        if (Array.isArray(data.ids)) {
            // Bulk update
            const { ids, updates } = data;
            await prisma.guest.updateMany({
                where: { id: { in: ids } },
                data: updates,
            });
            return NextResponse.json({ success: true });
        } else {
            // Single update (id must be provided in body if using PUT on listing route)
            const guest = await prisma.guest.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    side: data.side,
                    saveTheDate: data.saveTheDate,
                    invited: data.invited,
                    rsvp: data.rsvp,
                    numGuests: data.numGuests,
                    numChildren3to13: data.numChildren3to13,
                    numChildren0to3: data.numChildren0to3,
                    numAdultsPresent: data.numAdultsPresent,
                    numChildrenPresent: data.numChildrenPresent,
                    numChildren0to3Present: data.numChildren0to3Present,
                    numNotPresent: data.numNotPresent,
                    numPresent: (data.numAdultsPresent || 0)
                        + (data.numChildrenPresent || 0)
                        + (data.numChildren0to3Present || 0),
                    notes: data.notes,
                },
            });
            return NextResponse.json(guest);
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to update guests" }, { status: 500 });
    }
}
