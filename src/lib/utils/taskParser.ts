export function parseTaskInput(input: string, referenceDate: Date = new Date()) {
    let title = input;
    let priority = 3; // Default P3 (Operacional)
    let deadline: Date | null = null;

    // Extract Priority (e.g., P1, P2, P3, P4)
    const priorityMatch = input.match(/\bP([1-4])\b/i);
    if (priorityMatch) {
        priority = parseInt(priorityMatch[1], 10);
        title = title.replace(priorityMatch[0], '');
    }

    // Extract Deadline: @DD/MM/YYYY HH:mm or @DD/MM HH:mm
    const dateMatch = input.match(/@(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)(?:\s+(\d{1,2}:\d{2}))?/);
    if (dateMatch) {
        const rawDate = dateMatch[1];
        const rawTime = dateMatch[2] || '23:59'; // default to end of day if no time

        const [day, month, yearStr] = rawDate.split('/');
        const year = yearStr ?
            (yearStr.length === 2 ? `20${yearStr}` : yearStr)
            : referenceDate.getFullYear();

        const [hours, minutes] = rawTime.split(':');

        deadline = new Date(
            parseInt(year as string),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours),
            parseInt(minutes)
        );

        title = title.replace(dateMatch[0], '');
    }

    // Clean title (remove #tarefa, trim, remove multiple spaces)
    title = title.replace(/^\s*#tarefa\s+/i, '').trim();
    title = title.replace(/\s+/g, ' ');

    // Require deadline for system to work (if no deadline provided, default to end of day next day? 
    // For Orbiting Awareness, deadline is mandatory so returning null is fine, UI will prompt if null)

    return {
        title,
        priority,
        deadline
    };
}
