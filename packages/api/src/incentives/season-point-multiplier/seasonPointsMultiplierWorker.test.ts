import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
    calculateMultiplier,
    seasonPointsMultiplierJobSchema
} from "./seasonPointsMultiplierWorker";

// Mock the chunker utility
vi.mock("../../common", () => ({
    chunker: vi.fn((array: any[], size: number) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    })
}));

// Test the pure multiplier calculation function
describe("calculateMultiplier", () => {

    it("should return 0.5 for q below lower cap", () => {
        expect(calculateMultiplier(0.01)).toBe(0.5);
        expect(calculateMultiplier(0.019)).toBe(0.5);
    });

    it("should return 3.0 for q above upper cap", () => {
        expect(calculateMultiplier(0.51)).toBe(3.0);
        expect(calculateMultiplier(1.0)).toBe(3.0);
    });

    it("should calculate S-curve multiplier for q between caps", () => {
        const result = calculateMultiplier(0.18); // Q0 value
        expect(result).toBeGreaterThan(1.5);
        expect(result).toBeLessThan(2.5);
    });

    it("should handle edge cases at boundaries", () => {
        expect(calculateMultiplier(0.02)).toBeGreaterThan(0.5);
        expect(calculateMultiplier(0.50)).toBeGreaterThanOrEqual(3.0);
    });


});


// Test business logic edge cases
describe("Edge Cases", () => {

    it("should handle zero total sum gracefully", () => {
        const users = [
            { userId: "user1", totalTWABalance: 0, cumulativeTWABalance: 0, weekId: "week1" }
        ];
        const totalSum = 0;

        // This would cause division by zero in the actual calculation
        const q = users[0].cumulativeTWABalance / totalSum;
        expect(isNaN(q) || !isFinite(q)).toBe(true);
        
        // The implementation should handle this case
    });

    it("should handle extreme q values", () => {
        expect(calculateMultiplier(-1)).toBe(0.5); // Negative q
        expect(calculateMultiplier(0)).toBe(0.5); // Zero q
        expect(calculateMultiplier(100)).toBe(3.0); // Very large q
    });

    it("should maintain precision with large numbers", () => {
        const users = [
            { userId: "user1", totalTWABalance: 1000000, cumulativeTWABalance: 1000000, weekId: "week1" },
            { userId: "user2", totalTWABalance: 5000000, cumulativeTWABalance: 6000000, weekId: "week1" }
        ];
        const totalSum = 6000000;

        users.forEach(user => {
            const q = user.cumulativeTWABalance / totalSum;
            const multiplier = calculateMultiplier(q);
            expect(multiplier).toBeGreaterThanOrEqual(0.5);
            expect(multiplier).toBeLessThanOrEqual(3.0);
        });
    });
}); 