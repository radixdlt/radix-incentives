import { Decimal } from "decimal.js";

// Configure Decimal.js to handle higher precision
// We need at least 40 digits of precision to safely handle 18 decimal places during calculations
Decimal.set({ precision: 40, rounding: Decimal.ROUND_DOWN });

/**
 * I192 class to mimic Scrypto Decimal's I192 behavior
 * 
 * This class handles 192-bit representation of fixed-scale decimal numbers with 18 decimal places,
 * matching Scrypto's Decimal type as closely as possible.
 * 
 * Key features:
 * 1. Represents numbers with exactly 18 decimal places of precision
 * 2. Performs truncation (toward zero) after each operation to match Scrypto's behavior
 * 3. Enforces the same value range as Scrypto's Decimal type
 * 4. Always outputs values with exactly 18 decimal places
 * 
 * Truncation vs. Rounding:
 * - Scrypto's Decimal type truncates values toward zero after each operation
 * - For positive numbers, this means flooring the value (removing all digits beyond 18 decimals)
 * - For negative numbers, this means ceiling the value (removing all digits beyond 18 decimals)
 * - This is different from banker's rounding (which rounds to nearest, with ties to even)
 * - Truncation creates consistent, predictable behavior for financial calculations
 */
export class I192 {
  // Constants
  private static readonly DECIMALS = 18;
  private static readonly DECIMAL_FACTOR = new Decimal(10).pow(I192.DECIMALS);
  
  // Maximum and minimum values for I192 (as per Scrypto's Decimal)
  // Max: 3138550867693340381917894711603833208051.177722232017256447
  // Min: -3138550867693340381917894711603833208051.177722232017256448
  private static readonly MAX_VALUE = new Decimal("3138550867693340381917894711603833208051.177722232017256447");
  private static readonly MIN_VALUE = new Decimal("-3138550867693340381917894711603833208051.177722232017256448");

  // Internal value as Decimal
  private value: Decimal;

  /**
   * Constructor
   * @param value A string, number, or Decimal value
   */
  constructor(value: string | number | Decimal) {
    if (typeof value === "string" || typeof value === "number") {
      this.value = new Decimal(value);
    } else {
      this.value = value;
    }
    
    // Truncate to 18 decimal places to ensure precise representation
    this.value = this.truncateToDecimals(this.value);
    
    // Ensure value is within I192 range
    this.checkRange();
  }

  /**
   * Truncate a value to exactly 18 decimal places (floor for positive, ceiling for negative)
   * This mimics Scrypto's behavior of truncation toward zero after each operation.
   * 
   * Examples:
   * 123.4567890123456789123 -> 123.456789012345678900 (truncated)
   * -123.4567890123456789123 -> -123.456789012345678900 (truncated)
   */
  private truncateToDecimals(value: Decimal): Decimal {
    // Multiply by 10^18, truncate to integer, then divide by 10^18
    const multiplied = value.times(I192.DECIMAL_FACTOR);
    const truncated = value.isNegative() 
        ? multiplied.ceil() // For negative numbers, ceil is truncation toward zero
        : multiplied.floor(); // For positive numbers, floor is truncation toward zero
    return truncated.dividedBy(I192.DECIMAL_FACTOR);
  }

  /**
   * Creates a new I192 instance from a value
   */
  public static from(value: string | number | Decimal | I192): I192 {
    if (value instanceof I192) {
      return new I192(value.value);
    }
    return new I192(value);
  }

  /**
   * Creates an I192 with value 0
   */
  public static zero(): I192 {
    return new I192(0);
  }

  /**
   * Creates an I192 with value 1
   */
  public static one(): I192 {
    return new I192(1);
  }

  /**
   * Addition with intermediate truncation
   * 
   * Both the input and the result are truncated to 18 decimal places,
   * mimicking Scrypto's behavior of truncating after each operation.
   */
  public add(other: I192 | string | number | Decimal): I192 {
    const otherValue = other instanceof I192 ? other.value : new Decimal(other);
    
    // Truncate the other value to 18 decimals first
    const truncatedOther = this.truncateToDecimals(otherValue);
    
    // Perform addition and truncate the result
    const result = this.truncateToDecimals(this.value.plus(truncatedOther));
    
    return new I192(result);
  }

  /**
   * Subtraction with intermediate truncation
   * 
   * Both the input and the result are truncated to 18 decimal places,
   * mimicking Scrypto's behavior of truncating after each operation.
   */
  public subtract(other: I192 | string | number | Decimal): I192 {
    const otherValue = other instanceof I192 ? other.value : new Decimal(other);
    
    // Truncate the other value to 18 decimals first
    const truncatedOther = this.truncateToDecimals(otherValue);
    
    // Perform subtraction and truncate the result
    const result = this.truncateToDecimals(this.value.minus(truncatedOther));
    
    return new I192(result);
  }

  /**
   * Multiplication with intermediate truncation
   * 
   * Both the input and the result are truncated to 18 decimal places,
   * mimicking Scrypto's behavior of truncating after each operation.
   */
  public multiply(other: I192 | string | number | Decimal): I192 {
    const otherValue = other instanceof I192 ? other.value : new Decimal(other);
    
    // Truncate the other value to 18 decimals first
    const truncatedOther = this.truncateToDecimals(otherValue);
    
    // Perform multiplication and truncate the result
    const result = this.truncateToDecimals(this.value.times(truncatedOther));
    
    return new I192(result);
  }

  /**
   * Division with intermediate truncation
   * 
   * Both the input and the result are truncated to 18 decimal places,
   * mimicking Scrypto's behavior of truncating after each operation.
   * 
   * This operation is particularly sensitive to truncation, which can
   * cause different results compared to regular rounding methods.
   */
  public divide(other: I192 | string | number | Decimal): I192 {
    const otherValue = other instanceof I192 ? other.value : new Decimal(other);
    
    // Truncate the other value to 18 decimals first
    const truncatedOther = this.truncateToDecimals(otherValue);
    
    if (truncatedOther.isZero()) {
      throw new Error("Division by zero");
    }
    
    // Perform division and truncate the result
    const result = this.truncateToDecimals(this.value.dividedBy(truncatedOther));
    
    return new I192(result);
  }

  /**
   * Returns true if this value is greater than other
   */
  public greaterThan(other: I192 | string | number | Decimal): boolean {
    const otherValue = other instanceof I192 ? other.value : new Decimal(other);
    const truncatedOther = this.truncateToDecimals(otherValue);
    return this.value.greaterThan(truncatedOther);
  }

  /**
   * Returns true if this value is greater than or equal to other
   */
  public greaterThanOrEqualTo(other: I192 | string | number | Decimal): boolean {
    const otherValue = other instanceof I192 ? other.value : new Decimal(other);
    const truncatedOther = this.truncateToDecimals(otherValue);
    return this.value.greaterThanOrEqualTo(truncatedOther);
  }

  /**
   * Returns true if this value is less than other
   */
  public lessThan(other: I192 | string | number | Decimal): boolean {
    const otherValue = other instanceof I192 ? other.value : new Decimal(other);
    const truncatedOther = this.truncateToDecimals(otherValue);
    return this.value.lessThan(truncatedOther);
  }

  /**
   * Returns true if this value is less than or equal to other
   */
  public lessThanOrEqualTo(other: I192 | string | number | Decimal): boolean {
    const otherValue = other instanceof I192 ? other.value : new Decimal(other);
    const truncatedOther = this.truncateToDecimals(otherValue);
    return this.value.lessThanOrEqualTo(truncatedOther);
  }

  /**
   * Returns true if this value is equal to other
   */
  public equals(other: I192 | string | number | Decimal): boolean {
    const otherValue = other instanceof I192 ? other.value : new Decimal(other);
    const truncatedOther = this.truncateToDecimals(otherValue);
    return this.value.equals(truncatedOther);
  }

  /**
   * Returns true if this value is zero
   */
  public isZero(): boolean {
    return this.value.isZero();
  }

  /**
   * Returns true if this value is negative
   */
  public isNegative(): boolean {
    return this.value.isNegative();
  }

  /**
   * Returns true if this value is positive
   */
  public isPositive(): boolean {
    return this.value.isPositive();
  }

  /**
   * Returns a string representation with full 18 decimal places
   * Format matches Scrypto Decimal's exact precision
   */
  public toString(): string {
    // Use decimal.js toFixed to get exact decimal precision
    // toFixed returns a string with the exact number of decimal places
    const stringValue = this.value.toFixed(I192.DECIMALS);
    
    return stringValue;
  }

  /**
   * Returns the decimal value
   */
  public toDecimal(): Decimal {
    return new Decimal(this.value);
  }

  /**
   * Ensures the value is within the valid I192 range
   * Throws an error if out of range
   */
  private checkRange(): void {
    if (this.value.greaterThan(I192.MAX_VALUE)) {
      throw new Error("I192 overflow");
    }
    if (this.value.lessThan(I192.MIN_VALUE)) {
      throw new Error("I192 underflow");
    }
  }
}