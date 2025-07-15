-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "companyName" TEXT,
    "nip" TEXT,
    "invoiceAddress" TEXT,
    "variant" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "total" REAL NOT NULL,
    "delivery" TEXT NOT NULL,
    "payment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'nowe',
    "consent1" BOOLEAN NOT NULL DEFAULT false,
    "consent2" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Order" ("address", "city", "companyName", "consent1", "consent2", "createdAt", "delivery", "email", "firstName", "id", "invoiceAddress", "lastName", "nip", "payment", "phone", "price", "quantity", "total", "variant", "zipCode") SELECT "address", "city", "companyName", "consent1", "consent2", "createdAt", "delivery", "email", "firstName", "id", "invoiceAddress", "lastName", "nip", "payment", "phone", "price", "quantity", "total", "variant", "zipCode" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
