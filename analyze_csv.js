const fs = require('fs');

const content = fs.readFileSync('/Users/moyal/Desktop/Organisation/Mariage Eve & Tom - Invités Tom.csv', 'utf8');
const lines = content.split('\n');

let totalFromRows = 0;
let rowCount = 0;
const details = [];

for (let i = 4; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    // Column 7 is # Invités (index 7 starting from 0)
    // Let's verify columns:
    // 0: empty
    // 1: date/item
    // 2: empty
    // 3: Nom
    // 4: Save Date
    // 5: Invité
    // 6: RSVP
    // 7: # Invités

    const name = parts[3];
    const countStr = parts[7];
    const count = parseInt(countStr);

    if (name && !isNaN(count)) {
        totalFromRows += count;
        rowCount++;
        details.push({ name, count });
    }
}

console.log("Total rows found:", rowCount);
console.log("Sum of # Invités from individual rows:", totalFromRows);
console.log("Header says: 245");
console.log("Difference:", totalFromRows - 245);
