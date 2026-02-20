-- CreateTable
CREATE TABLE "Vendor" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "payer" TEXT NOT NULL,
    "method" TEXT,
    "date" DATETIME,
    "memo" TEXT,
    "hasReceipt" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "saveTheDate" BOOLEAN NOT NULL DEFAULT false,
    "invited" BOOLEAN NOT NULL DEFAULT false,
    "rsvp" TEXT NOT NULL DEFAULT 'PENDING',
    "numGuests" INTEGER NOT NULL DEFAULT 1,
    "numChildren3to13" INTEGER NOT NULL DEFAULT 0,
    "numNotPresent" INTEGER NOT NULL DEFAULT 0,
    "numPresent" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "weddingDate" DATETIME NOT NULL,
    "groomName" TEXT NOT NULL DEFAULT 'Tom',
    "brideName" TEXT NOT NULL DEFAULT 'Eve'
);
