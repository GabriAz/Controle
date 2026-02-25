import { describe, it, expect } from 'vitest';
import { parseTaskInput } from './taskParser';

describe('Intelligent Input Engine (taskParser)', () => {
    const referenceDate = new Date(2026, 1, 22); // 2026-02-22 (Month is 0-indexed in JS)

    it('parses a full task with priority and date/time', () => {
        const input = '#tarefa Criar Branding Art Cana P1 @25/02 14:00';
        const result = parseTaskInput(input, referenceDate);

        expect(result.title).toBe('Criar Branding Art Cana');
        expect(result.priority).toBe(1);
        expect(result.deadline).toBeInstanceOf(Date);
        expect(result.deadline?.getFullYear()).toBe(2026);
        expect(result.deadline?.getMonth()).toBe(1); // Feb
        expect(result.deadline?.getDate()).toBe(25);
        expect(result.deadline?.getHours()).toBe(14);
        expect(result.deadline?.getMinutes()).toBe(0);
    });

    it('parses a task without explicit time, defaulting to 23:59', () => {
        const input = '#tarefa Finalizar relatorio P2 @10/03';
        const result = parseTaskInput(input, referenceDate);

        expect(result.title).toBe('Finalizar relatorio');
        expect(result.priority).toBe(2);
        expect(result.deadline).toBeInstanceOf(Date);
        expect(result.deadline?.getFullYear()).toBe(2026);
        expect(result.deadline?.getMonth()).toBe(2); // March
        expect(result.deadline?.getDate()).toBe(10);
        expect(result.deadline?.getHours()).toBe(23);
        expect(result.deadline?.getMinutes()).toBe(59);
    });

    it('defaults to Priority 3 if no priority is provided', () => {
        const input = '#tarefa Ligar para cliente @25/02 09:00';
        const result = parseTaskInput(input, referenceDate);

        expect(result.title).toBe('Ligar para cliente');
        expect(result.priority).toBe(3);
    });

    it('handles lowercase priority and removes extra spaces', () => {
        const input = '   #tarefa   atualizar docs   p4   @01/04/2026   ';
        const result = parseTaskInput(input, referenceDate);

        expect(result.title).toBe('atualizar docs');
        expect(result.priority).toBe(4);
        expect(result.deadline?.getFullYear()).toBe(2026);
        expect(result.deadline?.getMonth()).toBe(3); // April
    });

    it('works without the #tarefa prefix', () => {
        const input = 'Comprar passagem P1 @30/11 10:00';
        const result = parseTaskInput(input, referenceDate);

        expect(result.title).toBe('Comprar passagem');
        expect(result.priority).toBe(1);
    });
});
