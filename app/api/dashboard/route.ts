import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calculateVendorStats } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const vendors = await prisma.vendor.findMany({
            include: { payments: true },
        });
        const guests = await prisma.guest.findMany();
        const settings = await prisma.settings.findUnique({ where: { id: "main" } });

        // Aggregate stats
        const vendorStats = vendors.map((v: any) => calculateVendorStats(v, guests));

        const dashboard = {
            totalEstimation: vendors.reduce((acc: number, v: any) => acc + (v.estimation || 0), 0),
            totalBudget: vendorStats.reduce((acc: number, s: any) => acc + s.totalAmount, 0),
            paidTotal: vendorStats.reduce((acc: number, s: any) => acc + s.paidTotal, 0),
            tomShare: vendorStats.reduce((acc: number, s: any) => acc + s.tomShare, 0),
            eveShare: vendorStats.reduce((acc: number, s: any) => acc + s.eveShare, 0),
            tomOwes: vendorStats.reduce((acc: number, s: any) => acc + s.tomOwes, 0),
            eveOwes: vendorStats.reduce((acc: number, s: any) => acc + s.eveOwes, 0),
            paidTom: vendorStats.reduce((acc: number, s: any) => acc + s.paidTom, 0),
            paidEve: vendorStats.reduce((acc: number, s: any) => acc + s.paidEve, 0),

            vendorBreakdown: vendors.map((v: any, i: number) => ({
                id: v.id,
                name: v.name,
                totalAmount: vendorStats[i].totalAmount,
                tomOwes: vendorStats[i].tomOwes,
                eveOwes: vendorStats[i].eveOwes,
            })),

            guestStats: {
                totalInvited: guests.reduce((acc: number, g: any) => acc + g.numGuests + g.numChildren3to13 + (g.numChildren0to3 || 0), 0),
                totalConfirmed: guests.reduce((acc: number, g: any) => acc + g.numAdultsPresent + g.numChildrenPresent + (g.numChildren0to3Present || 0), 0),
                tomInvited: guests.filter((g: any) => g.side === 'TOM').reduce((acc: number, g: any) => acc + g.numGuests + g.numChildren3to13 + (g.numChildren0to3 || 0), 0),
                eveInvited: guests.filter((g: any) => g.side === 'EVE').reduce((acc: number, g: any) => acc + g.numGuests + g.numChildren3to13 + (g.numChildren0to3 || 0), 0),
                tomConfirmed: guests.filter((g: any) => g.side === 'TOM').reduce((acc: number, g: any) => acc + g.numAdultsPresent + g.numChildrenPresent + (g.numChildren0to3Present || 0), 0),
                eveConfirmed: guests.filter((g: any) => g.side === 'EVE').reduce((acc: number, g: any) => acc + g.numAdultsPresent + g.numChildrenPresent + (g.numChildren0to3Present || 0), 0),
                rsvpRate: guests.length > 0
                    ? (guests.filter((g: any) => g.rsvp !== 'PENDING').length / guests.length) * 100
                    : 0,
            },
            weddingDate: settings?.weddingDate || new Date("2026-08-09"),
        };

        return NextResponse.json(dashboard);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to generate dashboard" }, { status: 500 });
    }
}
