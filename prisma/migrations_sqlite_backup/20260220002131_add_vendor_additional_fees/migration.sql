-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "estimatedTotal" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "estimation" REAL,
    "additionalFees" REAL NOT NULL DEFAULT 0,
    "pricingModel" TEXT NOT NULL DEFAULT 'FIXED',
    "pricePerGuest" REAL,
    "fixedGuestCountTom" INTEGER,
    "fixedGuestCountEve" INTEGER,
    "includeChildren" BOOLEAN NOT NULL DEFAULT false,
    "guestCountBasis" TEXT NOT NULL DEFAULT 'INVITED',
    "paymentResponsibility" TEXT NOT NULL DEFAULT 'SPLIT_50_50',
    "customTomPercentage" REAL,
    "customEvePercentage" REAL,
    "allocationMode" TEXT NOT NULL DEFAULT 'TOTAL_STANDARD',
    "remainingResponsibility" TEXT NOT NULL DEFAULT 'SPLIT_50_50',
    "customRemainingTomPercentage" REAL,
    "customRemainingEvePercentage" REAL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Vendor" ("allocationMode", "category", "createdAt", "customEvePercentage", "customRemainingEvePercentage", "customRemainingTomPercentage", "customTomPercentage", "estimatedTotal", "estimation", "fixedGuestCountEve", "fixedGuestCountTom", "guestCountBasis", "id", "includeChildren", "name", "notes", "paymentResponsibility", "pricePerGuest", "pricingModel", "remainingResponsibility", "status", "totalAmount", "updatedAt") SELECT "allocationMode", "category", "createdAt", "customEvePercentage", "customRemainingEvePercentage", "customRemainingTomPercentage", "customTomPercentage", "estimatedTotal", "estimation", "fixedGuestCountEve", "fixedGuestCountTom", "guestCountBasis", "id", "includeChildren", "name", "notes", "paymentResponsibility", "pricePerGuest", "pricingModel", "remainingResponsibility", "status", "totalAmount", "updatedAt" FROM "Vendor";
DROP TABLE "Vendor";
ALTER TABLE "new_Vendor" RENAME TO "Vendor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
