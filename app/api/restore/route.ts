import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const dbPath = path.resolve(process.cwd(), "prisma/dev.db");

        // Simple overwrite for local app
        fs.writeFileSync(dbPath, buffer);

        return NextResponse.json({ success: true, message: "Database restored successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to restore database" }, { status: 500 });
    }
}
