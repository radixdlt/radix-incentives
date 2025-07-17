import { describe, it, expect, vi } from "vitest";
import { BigNumber } from "bignumber.js";
import { 
    calculateMultiplier,
} from "./seasonPointsMultiplierWorker";

// Mock the chunker utility
vi.mock("../../common", () => ({
    chunker: vi.fn((array: unknown[], size: number) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    })
}));

// Test the pure multiplier calculation function
describe("calculateMultiplier", () => {

    it("should return 0.5 for XRD balance below 10,000", () => {
        expect(calculateMultiplier(new BigNumber(1000))).toBe(0.5);
        expect(calculateMultiplier(new BigNumber(9999))).toBe(0.5);
        expect(calculateMultiplier(new BigNumber(0))).toBe(0.5);
    });

    it("should return 3.0 for XRD balance above 75,000,000", () => {
        expect(calculateMultiplier(new BigNumber(75000000))).toBe(3.0);
        expect(calculateMultiplier(new BigNumber(100000000))).toBe(3.0);
    });

    it("should calculate S-curve multiplier for XRD balance between 10,000 and 75,000,000", () => {
        // Test with 50,000 XRD - should be in the S-curve range
        const result = calculateMultiplier(new BigNumber(50000));
        expect(result).toBeGreaterThan(0.5);
        expect(result).toBeLessThan(3.0);
        
        // Test with 1,000,000 XRD - should be higher on the curve
        const result2 = calculateMultiplier(new BigNumber(1000000));
        expect(result2).toBeGreaterThan(result);
        expect(result2).toBeLessThan(3.0);
    });

    it("should handle edge cases at boundaries", () => {
        // Just above the lower threshold
        expect(calculateMultiplier(new BigNumber(10000))).toBeGreaterThan(0.5);
        
        // Just below the upper threshold
        const result = calculateMultiplier(new BigNumber(74999999));
        expect(result).toBeLessThan(3.0);
        expect(result).toBeGreaterThan(0.5);

        const result2 = calculateMultiplier(new BigNumber(75000000));
        expect(Number( result2.toFixed(2))).toBe(3.0);
        expect(result2).toBeGreaterThan(0.5);
        

    });

});


// Test business logic edge cases
describe("Edge Cases", () => {

    it("should handle zero XRD balance", () => {
        const result = calculateMultiplier(new BigNumber(0));
        expect(result).toBe(0.5);
    });

    it("should handle negative XRD balance", () => {
        const result = calculateMultiplier(new BigNumber(-1000));
        expect(result).toBe(0.5); // Should still return minimum multiplier
    });

    it("should handle extremely large XRD balance", () => {
        const result = calculateMultiplier(new BigNumber("999999999999"));
        expect(result).toBe(3.0); // Should cap at maximum multiplier
    });

    it("should maintain precision with large XRD numbers", () => {
        const testBalances = [
            new BigNumber(1000000), // 1M XRD
            new BigNumber(5000000), // 5M XRD  
            new BigNumber(50000000) // 50M XRD
        ];

        for (const balance of testBalances) {
            const multiplier = calculateMultiplier(balance);
            expect(multiplier).toBeGreaterThanOrEqual(0.5);
            expect(multiplier).toBeLessThanOrEqual(3.0);
        }
    });

    it("should produce S-curve progression", () => {
        // Test that multiplier increases as XRD balance increases
        const balance1 = new BigNumber(20000);   // 20K XRD
        const balance2 = new BigNumber(100000);  // 100K XRD
        const balance3 = new BigNumber(1000000); // 1M XRD
        
        const multiplier1 = calculateMultiplier(balance1);
        const multiplier2 = calculateMultiplier(balance2);
        const multiplier3 = calculateMultiplier(balance3);
        
        expect(multiplier2).toBeGreaterThan(multiplier1);
        expect(multiplier3).toBeGreaterThan(multiplier2);
    });
}); 