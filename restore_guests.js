const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const restoreData = [
    { name: "Abecassis", numAdultsPresent: 3, numChildrenPresent: 0 },
    { name: "Alezra Ely", numAdultsPresent: 3, numChildrenPresent: 0 },
    { name: "Berdah Ronnie", numAdultsPresent: 1, numChildrenPresent: 0 },
    { name: "Dallal", numAdultsPresent: 1, numChildrenPresent: 0 },
    { name: "Elkaim Gary", numAdultsPresent: 2, numChildrenPresent: 0 },
    { name: "Fernandez Sandrine", numAdultsPresent: 5, numChildrenPresent: 0 },
    { name: "Lambert Jenny", numAdultsPresent: 2, numChildrenPresent: 0 },
    { name: "Laulan Jeremy", numAdultsPresent: 2, numChildrenPresent: 0 },
    { name: "Zanzouri Aaron Levana", numAdultsPresent: 0, numChildrenPresent: 0 }, // User says 2 present in the text? Wait, Zanzouri: 2 adults invited, 1 kid. User says "2" in #Present column but then 0? I will follow the explicit #Present column.
    { name: "Zerbib Iris", numAdultsPresent: 3, numChildrenPresent: 0 },
    { name: "Zouari Maya Nathan", numAdultsPresent: 2, numChildrenPresent: 0 },
];

async function main() {
    const guests = await prisma.guest.findMany();
    console.log(`Processing ${guests.length} guests for restore and cleanup...`);

    let updatedCount = 0;
    for (const guest of guests) {
        // 1. Clean name (remove trailing numbers/plus)
        const cleanedName = guest.name.replace(/\s(\+?\d+)$/, "").trim();

        // 2. Find if this guest has restore data
        const restoreInfo = restoreData.find(r => cleanedName.toLowerCase().includes(r.name.toLowerCase()));

        await prisma.guest.update({
            where: { id: guest.id },
            data: {
                name: cleanedName,
                saveTheDate: true,
                rsvp: "PENDING",
                numAdultsPresent: restoreInfo ? restoreInfo.numAdultsPresent : 0,
                numChildrenPresent: restoreInfo ? restoreInfo.numChildrenPresent : 0,
                // Sync numPresent for backward compatibility if any components still use it
                numPresent: restoreInfo ? (restoreInfo.numAdultsPresent + restoreInfo.numChildrenPresent) : 0,
            },
        });
        updatedCount++;
    }

    console.log(`Restore and cleanup complete. Updated ${updatedCount} guests.`);
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
