export function calculateUrgency(priorityLabel: number, deadline: Date, referenceDate: Date = new Date()): number {
    // Convert standard priority (1 for P1, 4 for P4) to a Weight (P1 = 4, P4 = 1)
    // Assuming priorities are 1, 2, 3, 4. If invalid, default to 1 (lowest weight).
    let weight = 1;
    if (priorityLabel === 1) weight = 4;
    else if (priorityLabel === 2) weight = 3;
    else if (priorityLabel === 3) weight = 2;
    else if (priorityLabel === 4) weight = 1;

    // Calculate time remaining in hours
    const diffMs = deadline.getTime() - referenceDate.getTime();
    let timeRemainingHours = diffMs / (1000 * 60 * 60);

    // If the task is overdue or extremely close, cap the time at 0.01 hours (36 seconds) 
    // to avoid division by zero and correctly skyrocket the urgency for overdue tasks.
    if (timeRemainingHours <= 0) {
        // Making overdue tasks increasingly urgent based on how overdue they are is optional,
        // but capping at 0.01 ensures they trump almost any pending task. 
        // Wait, if it's deeply overdue, maybe we want it even higher?
        // Let's cap at 0.01 to ensure mathematical safety, or use a formula that factors overdue time.
        // For simplicity:
        timeRemainingHours = 0.01;
    }

    // Calculate Urgency Index U = Priority / Time_Remaining
    const urgency = weight / timeRemainingHours;

    return urgency;
}

export function sortTasksByUrgency<T extends { priority: number, deadline: Date }>(tasks: T[], referenceDate: Date = new Date()): T[] {
    return [...tasks].sort((a, b) => {
        const uA = calculateUrgency(a.priority, a.deadline, referenceDate);
        const uB = calculateUrgency(b.priority, b.deadline, referenceDate);
        // Sort descending (highest urgency first)
        return uB - uA;
    });
}
