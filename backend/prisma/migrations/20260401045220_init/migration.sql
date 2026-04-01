/*
  Warnings:

  - You are about to drop the `HTTPRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HTTPRequest";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "HttpRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "headers" JSONB,
    "body" TEXT,
    "collectionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HttpRequest_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
