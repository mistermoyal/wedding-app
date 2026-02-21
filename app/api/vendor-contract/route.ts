import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }

        const filename = (file.name || "contract.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
        const blob = await put(`contracts/${Date.now()}-${filename}`, file, {
            // @ts-expect-error private store access
            access: "private",
            contentType: file.type || "application/pdf",
        });

        return NextResponse.json({
            url: blob.url,
            downloadUrl: blob.downloadUrl,
            name: file.name || filename,
        });
    } catch (error) {
        console.error("Upload contract failed:", error);
        return NextResponse.json(
            { error: "Upload failed", details: String(error) },
            { status: 500 }
        );
    }
}
