-- CreateTable
CREATE TABLE "ApiResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "statusCode" INTEGER NOT NULL,
    "statusText" TEXT NOT NULL,
    "headers" JSONB,
    "body" TEXT,
    "requestId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiResponse_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "HttpRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
