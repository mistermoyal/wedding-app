-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "estimatedTotal" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "pricingModel" TEXT NOT NULL DEFAULT 'FIXED',
    "pricePerGuest" REAL,
    "includeChildren" BOOLEAN NOT NULL DEFAULT false,
    "guestCountBasis" TEXT NOT NULL DEFAULT 'INVITED',
    "paymentResponsibility" TEXT NOT NULL DEFAULT 'SPLIT_50_50',
    "customTomPercentage" REAL,
    "customEvePercentage" REAL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Vendor" ("category", "createdAt", "customEvePercentage", "customTomPercentage", "estimatedTotal", "guestCountBasis", "id", "includeChildren", "name", "notes", "paymentResponsibility", "pricePerGuest", "pricingModel", "totalAmount", "updatedAt") SELECT "category", "createdAt", "customEvePercentage", "customTomPercentage", "estimatedTotal", "guestCountBasis", "id", "includeChildren", "name", "notes", "paymentResponsibility", "pricePerGuest", "pricingModel", "totalAmount", "updatedAt" FROM "Vendor";
DROP TABLE "Vendor";
ALTER TABLE "new_Vendor" RENAME TO "Vendor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
