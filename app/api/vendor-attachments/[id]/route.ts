import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const attachment = await prisma.vendorAttachment.findUnique({ where: { id } });
        if (!attachment) {
            return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
        }

        await del(attachment.url);
        await prisma.vendorAttachment.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete attachment failed:", error);
        return NextResponse.json(
            { error: "Delete failed", details: String(error) },
            { status: 500 }
        );
    }
}
