
import readingPlan from '../data/reading-plan.json';

export interface ReadingPlanDay {
    day: number;
    passage: string;
    theme: string;
    category: string;
    book: string;
    estimatedTime: string;
}

class ReadingPlanService {
    private plan: ReadingPlanDay[] = readingPlan;

    getPlanForDay(day: number): ReadingPlanDay | undefined {
        return this.plan.find(p => p.day === day);
    }

    getCurrentDay(): number {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = (now.getTime() - start.getTime());
        const oneDay = 1000 * 60 * 60 * 24;
        const day = Math.floor(diff / oneDay);

        // Ensure we stay within 1-365 range
        return Math.min(Math.max(day, 1), 365);
    }

    getTotalDays(): number {
        return 365;
    }
}

export const readingPlanService = new ReadingPlanService();
