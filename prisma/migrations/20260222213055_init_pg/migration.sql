-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "taskRef" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "snoozedUntil" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notified3Days" BOOLEAN NOT NULL DEFAULT false,
    "notified2Days" BOOLEAN NOT NULL DEFAULT false,
    "notified1Day" BOOLEAN NOT NULL DEFAULT false,
    "notified3Hours" BOOLEAN NOT NULL DEFAULT false,
    "notified2Hours" BOOLEAN NOT NULL DEFAULT false,
    "notified1Hour" BOOLEAN NOT NULL DEFAULT false,
    "notified30Mins" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_taskRef_key" ON "Task"("taskRef");
