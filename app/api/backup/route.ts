import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
        const dbContent = fs.readFileSync(dbPath);

        return new NextResponse(dbContent, {
            headers: {
                "Content-Type": "application/x-sqlite3",
                "Content-Disposition": 'attachment; filename="wedding_backup.db"',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to generate backup" }, { status: 500 });
    }
}
