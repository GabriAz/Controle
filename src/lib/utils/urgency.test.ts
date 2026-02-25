import { describe, it, expect } from 'vitest';
import { calculateUrgency, sortTasksByUrgency } from './urgency';

describe('Urgency Calculation ($U$)', () => {
    const referenceDate = new Date('2026-02-22T12:00:00Z');

    it('calculates higher urgency for P3 due in 30min than P1 due in 5 days', () => {
        // P3 due in 30 minutes (0.5 hours)
        const deadline1 = new Date(referenceDate.getTime() + 30 * 60 * 1000);
        const u1 = calculateUrgency(3, deadline1, referenceDate);

        // P1 due in 5 days (120 hours)
        const deadline2 = new Date(referenceDate.getTime() + 5 * 24 * 60 * 60 * 1000);
        const u2 = calculateUrgency(1, deadline2, referenceDate);

        expect(u1).toBeGreaterThan(u2);
    });

    it('sorts tasks correctly by Urgency', () => {
        const tasks = [
            { id: 1, priority: 1, deadline: new Date(referenceDate.getTime() + 24 * 60 * 60 * 1000) }, // P1 in 24h
            { id: 2, priority: 3, deadline: new Date(referenceDate.getTime() + 1 * 60 * 60 * 1000) },  // P3 in 1h
            { id: 3, priority: 2, deadline: new Date(referenceDate.getTime() - 2 * 60 * 60 * 1000) }   // P2 Overdue
        ];

        const sorted = sortTasksByUrgency(tasks, referenceDate);

        // 1. Task 3 (Overdue => U is extremely high)
        // 2. Task 2 (1 hour away, P3(weight=2) => U = 2)
        // 3. Task 1 (24 hours away, P1(weight=4) => U = 4/24 = 0.16)

        expect(sorted[0].id).toBe(3);
        expect(sorted[1].id).toBe(2);
        expect(sorted[2].id).toBe(1);
    });

    it('caps overdue urgency properly', () => {
        const overdueDeadline = new Date(referenceDate.getTime() - 10000);
        const u = calculateUrgency(1, overdueDeadline, referenceDate);
        // Weight for P1 is 4. Cap time is 0.01. Urgency = 400.
        expect(u).toBe(400);
    });
});
