-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "initialFormData" JSONB,
    "threadId" TEXT,
    "history" JSONB NOT NULL DEFAULT [],
    "status" TEXT NOT NULL DEFAULT 'awaiting_form',
    "designData" JSONB,
    "leafletUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_threadId_key" ON "Conversation"("threadId");
