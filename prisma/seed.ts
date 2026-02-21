import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import path from "path";

const prisma = new PrismaClient();

const XLSX_PATH = path.resolve(__dirname, "../../Mariage Eve & Tom.xlsx");

interface VendorSeedData {
    name: string;
    estimatedTotal: number;
    totalAmount: number;
    paidTom: number;
    paidEve: number;
    paidTotal: number;
    remaining: number;
    remainingTom: number;
    remainingEve: number;
}

function safeNumber(val: unknown): number {
    if (val === null || val === undefined || val === "" || val === false) return 0;
    const n = Number(val);
    return isNaN(n) ? 0 : n;
}

function safeDate(val: unknown): Date | null {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (typeof val === "number") {
        // Excel serial date
        const epoch = new Date(1899, 11, 30);
        epoch.setDate(epoch.getDate() + val);
        return epoch;
    }
    const d = new Date(String(val));
    return isNaN(d.getTime()) ? null : d;
}

function safeBool(val: unknown): boolean {
    if (val === true || val === "TRUE" || val === "Oui" || val === "oui" || val === 1) return true;
    return false;
}

function parseRSVP(val: unknown): string {
    if (val === true || val === "TRUE" || val === "Oui" || val === "oui" || val === 1) return "YES";
    if (val === false || val === "FALSE" || val === "Non" || val === "non" || val === 0) return "NO";
    return "PENDING";
}

async function seedVendors(wb: XLSX.WorkBook): Promise<Map<string, string>> {
    const ws = wb.Sheets["Résumé"];
    if (!ws) throw new Error("Sheet 'Résumé' not found");

    const vendors: VendorSeedData[] = [];
    const vendorNames: string[] = [];

    for (let row = 4; row <= 20; row++) {
        const name = ws[XLSX.utils.encode_cell({ r: row - 1, c: 0 })]?.v;
        if (!name || typeof name !== "string" || name.trim() === "") continue;

        const estimated = safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 1 })]?.v);
        const total = safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 2 })]?.v);
        const paidTom = safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 3 })]?.v);
        const paidEve = safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 4 })]?.v);
        const paidTotal = safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 5 })]?.v);
        const remaining = safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 6 })]?.v);
        const remainingTom = safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 7 })]?.v);
        const remainingEve = safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 8 })]?.v);

        vendors.push({
            name: name.trim(),
            estimatedTotal: estimated,
            totalAmount: total,
            paidTom,
            paidEve,
            paidTotal,
            remaining,
            remainingTom,
            remainingEve,
        });
        vendorNames.push(name.trim());
    }

    console.log(`Found ${vendors.length} vendors: ${vendorNames.join(", ")}`);

    const perGuestVendors = ["Salle TEL-YA", "Bar TEL-YA"];
    const vendorIdMap = new Map<string, string>();

    for (const v of vendors) {
        const isPerGuest = perGuestVendors.includes(v.name);
        const responsibility = isPerGuest ? "PER_INVITEE_BY_FAMILY" : "SPLIT_50_50";

        let pricePerGuest: number | null = null;
        if (isPerGuest) {
            const tomSheet = wb.Sheets["Paiements Tom"];
            if (tomSheet) {
                for (let r = 1; r <= 30; r++) {
                    const cellName = tomSheet[XLSX.utils.encode_cell({ r: r - 1, c: 0 })]?.v;
                    if (cellName && typeof cellName === "string" && cellName.trim() === v.name) {
                        const totalFor225 = safeNumber(tomSheet[XLSX.utils.encode_cell({ r: r - 1, c: 1 })]?.v);
                        if (totalFor225 > 0) {
                            pricePerGuest = totalFor225 / 225;
                        }
                        break;
                    }
                }
            }
        }

        const vendor = await prisma.vendor.create({
            data: {
                name: v.name,
                estimatedTotal: v.estimatedTotal,
                totalAmount: v.totalAmount > 0 ? v.totalAmount : v.estimatedTotal,
                pricingModel: isPerGuest ? "PER_GUEST" : "FIXED",
                pricePerGuest: pricePerGuest,
                includeChildren: false,
                guestCountBasis: "INVITED",
                paymentResponsibility: responsibility,
                notes: null,
            },
        });

        vendorIdMap.set(v.name, vendor.id);
        console.log(`  Created vendor: ${v.name} (${vendor.id})`);
    }

    return vendorIdMap;
}

const VENDOR_NAME_MAP: Record<string, string> = {
    DJ: "DJ + Saxo + Djembe",
    "Vidéo/Photo": "Vidéo/Photo",
    "Décoration Henné": "Décoration Henné",
    "Salle Shabbat": "Salle Shabbat",
    Rabbanout: "Rabbanout",
    Akoum: "Akoum",
    "Léa Wedding Planner": "Léa Wedding Planner",
    Décoratrice: "Décoratrice",
    "Salle TEL-YA": "Salle TEL-YA",
    "Bar TEL-YA": "Bar TEL-YA",
    "Traiteur Shabbat": "Traiteur Shabbat",
    "Muriel Pièce Monté": "Muriel Pièce Monté",
    "Chanteur Houpa": "Chanteur Houpa",
    "Chanteur Soirée": "Chanteur Soirée",
};

function findVendorId(name: string, vendorIdMap: Map<string, string>): string | null {
    if (vendorIdMap.has(name)) return vendorIdMap.get(name)!;
    const mapped = VENDOR_NAME_MAP[name];
    if (mapped && vendorIdMap.has(mapped)) return vendorIdMap.get(mapped)!;
    for (const [vName, vId] of vendorIdMap.entries()) {
        if (vName.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(vName.toLowerCase())) {
            return vId;
        }
    }
    return null;
}

async function seedPaymentsCommon(wb: XLSX.WorkBook, vendorIdMap: Map<string, string>) {
    const ws = wb.Sheets["Paiements commun"];
    if (!ws) return;
    let paymentCount = 0;
    for (let row = 2; row <= 100; row++) {
        const vendorName = ws[XLSX.utils.encode_cell({ r: row - 1, c: 0 })]?.v;
        if (!vendorName || typeof vendorName !== "string") continue;
        const date = safeDate(ws[XLSX.utils.encode_cell({ r: row - 1, c: 1 })]?.v);
        const amountTom = safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 2 })]?.v);
        const amountEve = safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 3 })]?.v);
        const hasReceipt = safeBool(ws[XLSX.utils.encode_cell({ r: row - 1, c: 7 })]?.v);
        if (amountTom === 0 && amountEve === 0) continue;
        if (!date) continue;
        const vendorId = findVendorId(vendorName.trim(), vendorIdMap);
        if (!vendorId) continue;
        if (amountTom > 0) {
            await prisma.payment.create({
                data: { vendorId, amount: amountTom, payer: "TOM", method: "Virement", date, memo: "Imported from Excel (Common sheet)", hasReceipt },
            });
            paymentCount++;
        }
        if (amountEve > 0) {
            await prisma.payment.create({
                data: { vendorId, amount: amountEve, payer: "EVE", method: "Virement", date, memo: "Imported from Excel (Common sheet)", hasReceipt },
            });
            paymentCount++;
        }
    }
    console.log(`Created ${paymentCount} payments from 'Paiements commun' sheet`);
}

async function seedPaymentsSide(wb: XLSX.WorkBook, vendorIdMap: Map<string, string>, sheetName: string, payer: "TOM" | "EVE") {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;
    let paymentCount = 0;
    for (let row = 2; row <= 30; row++) {
        const vendorName = ws[XLSX.utils.encode_cell({ r: row - 1, c: 0 })]?.v;
        const date = safeDate(ws[XLSX.utils.encode_cell({ r: row - 1, c: 3 })]?.v);
        const amount = safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 4 })]?.v);
        if (amount === 0 || !date) continue;
        let resolvedVendor = vendorName;
        if (!resolvedVendor || typeof resolvedVendor !== "string") {
            for (let r = row - 1; r >= 2; r--) {
                const prev = ws[XLSX.utils.encode_cell({ r: r - 1, c: 0 })]?.v;
                if (prev && typeof prev === "string") {
                    resolvedVendor = prev;
                    break;
                }
            }
        }
        if (!resolvedVendor) continue;
        const vendorId = findVendorId(String(resolvedVendor).trim(), vendorIdMap);
        if (!vendorId) continue;
        await prisma.payment.create({
            data: { vendorId, amount, payer, method: "Virement", date, memo: `Imported from Excel (${sheetName})`, hasReceipt: false },
        });
        paymentCount++;
    }
    console.log(`Created ${paymentCount} payments from '${sheetName}' sheet`);
}

async function seedGuests(wb: XLSX.WorkBook) {
    let totalCount = 0;
    for (const config of [{ sheet: "Invités Eve", side: "EVE" as const }, { sheet: "Invités Tom", side: "TOM" as const }]) {
        const ws = wb.Sheets[config.sheet];
        if (!ws) continue;
        let count = 0;
        for (let row = 5; row <= 300; row++) {
            const name = ws[XLSX.utils.encode_cell({ r: row - 1, c: 3 })]?.v;
            if (!name || typeof name !== "string" || name.trim() === "") continue;
            const saveTheDate = safeBool(ws[XLSX.utils.encode_cell({ r: row - 1, c: 4 })]?.v);
            const invited = safeBool(ws[XLSX.utils.encode_cell({ r: row - 1, c: 5 })]?.v);
            const rsvp = parseRSVP(ws[XLSX.utils.encode_cell({ r: row - 1, c: 6 })]?.v);
            const numGuests = Math.max(1, Math.round(safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 7 })]?.v)));
            const numChildren = Math.round(safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 8 })]?.v));
            const numNotPresent = Math.round(safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 9 })]?.v));
            const numPresent = Math.round(safeNumber(ws[XLSX.utils.encode_cell({ r: row - 1, c: 10 })]?.v));
            await prisma.guest.create({
                data: {
                    name: name.trim(),
                    side: config.side,
                    saveTheDate,
                    invited,
                    rsvp,
                    numGuests,
                    numChildren3to13: numChildren,
                    numChildren0to3: 0,
                    numChildren0to3Present: 0,
                    numNotPresent: numNotPresent,
                    numPresent: numPresent,
                },
            });
            count++;
        }
        console.log(`Created ${count} guests from '${config.sheet}'`);
        totalCount += count;
    }
    console.log(`Total guests seeded: ${totalCount}`);
}

async function main() {
    console.log("🌱 Seeding wedding database...");
    const wb = XLSX.readFile(XLSX_PATH);
    await prisma.payment.deleteMany();
    await prisma.guest.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.settings.deleteMany();
    await prisma.settings.create({
        data: { id: "main", weddingDate: new Date("2026-08-09T00:00:00Z"), groomName: "Tom", brideName: "Eve" },
    });
    const vendorIdMap = await seedVendors(wb);
    await seedPaymentsCommon(wb, vendorIdMap);
    await seedPaymentsSide(wb, vendorIdMap, "Paiements Tom", "TOM");
    await seedPaymentsSide(wb, vendorIdMap, "Paiements Eve", "EVE");
    await seedGuests(wb);
    console.log("\n✅ Seeding complete!");
}

main().catch((e) => { console.error("❌ Seed error:", e); process.exit(1); }).finally(() => prisma.$disconnect());
