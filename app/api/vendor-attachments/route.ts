import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const vendorId = formData.get("vendorId");

        if (!(file instanceof File) || typeof vendorId !== "string") {
            return NextResponse.json({ error: "Missing file or vendorId" }, { status: 400 });
        }

        const filename = (file.name || "attachment").replace(/[^a-zA-Z0-9._-]/g, "_");
        const blob = await put(`contracts/${vendorId}/${Date.now()}-${filename}`, file, {
            access: "public",
            contentType: file.type || "application/octet-stream",
        });

        const attachment = await prisma.vendorAttachment.create({
            data: {
                vendorId,
                url: blob.url,
                name: file.name || filename,
                contentType: file.type || null,
            },
        });

        return NextResponse.json(attachment);
    } catch (error) {
        console.error("Upload vendor attachment failed:", error);
        return NextResponse.json(
            { error: "Upload failed", details: String(error) },
            { status: 500 }
        );
    }
}
