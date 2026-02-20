const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

async function compareCounts() {
    const prisma = new PrismaClient();
    const dbGuests = await prisma.guest.findMany({ where: { side: 'TOM' } });

    const csvContent = fs.readFileSync('/Users/moyal/Desktop/Organisation/Mariage Eve & Tom - Invités Tom.csv', 'utf8');
    const csvLines = csvContent.split('\n');
    const csvData = {};
    for (let i = 4; i < csvLines.length; i++) {
        const parts = csvLines[i].split(',');
        const name = parts[3]?.trim();
        const count = parseInt(parts[7]);
        if (name) {
            // Clean name as I did in DB
            const cleanName = name.replace(/\s\+\d+$/, '').replace(/\d+$/, '').trim();
            csvData[cleanName] = (csvData[cleanName] || 0) + count;
        }
    }

    console.log("Mismatches between CSV row count and DB fields:");
    for (const g of dbGuests) {
        const dbTotal = g.numGuests + g.numChildren3to13;
        const csvTotal = csvData[g.name];
        if (dbTotal !== csvTotal) {
            console.log(`[${g.name}] DB: ${dbTotal} vs CSV: ${csvTotal}`);
        }
    }
}

compareCounts();
