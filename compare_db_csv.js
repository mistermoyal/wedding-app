const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

async function compare() {
    const prisma = new PrismaClient();
    const dbGuests = await prisma.guest.findMany({ where: { side: 'TOM' } });
    const dbNames = dbGuests.map(g => g.name);

    const csvContent = fs.readFileSync('/Users/moyal/Desktop/Organisation/Mariage Eve & Tom - Invités Tom.csv', 'utf8');
    const csvLines = csvContent.split('\n');
    const csvNames = [];
    for (let i = 4; i < csvLines.length; i++) {
        const parts = csvLines[i].split(',');
        const name = parts[3]?.trim();
        if (name) csvNames.push(name);
    }

    console.log("DB count:", dbNames.length);
    console.log("CSV count:", csvNames.length);

    const extraInDb = dbNames.filter(name => !csvNames.includes(name));
    const missingInDb = csvNames.filter(name => !dbNames.includes(name));

    console.log("Extra in DB:", extraInDb);
    console.log("Missing in DB:", missingInDb);

    // Also check for duplicates in DB
    const duplicates = dbNames.filter((item, index) => dbNames.indexOf(item) !== index);
    console.log("Duplicates in DB:", duplicates);
}

compare();
