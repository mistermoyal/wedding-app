const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const guests = await prisma.guest.findMany();
    console.log(`Processing ${guests.length} guests...`);

    let updatedCount = 0;
    for (const guest of guests) {
        // Remove trailing " 3" or " +3"
        // Regex: Match space followed by an optional plus, then one or more digits at the end of string
        const cleanedName = guest.name.replace(/\s(\+?\d+)$/, "").trim();

        await prisma.guest.update({
            where: { id: guest.id },
            data: {
                name: cleanedName,
                saveTheDate: true,
                rsvp: "PENDING",
                numAdultsPresent: 0,
                numChildrenPresent: 0,
                numPresent: 0,
                numNotPresent: 0,
            },
        });
        updatedCount++;
    }

    console.log(`Cleanup complete. Updated ${updatedCount} guests.`);
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
