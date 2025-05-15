/**
 * Base error class for the library
 */
export class BaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Input validation errors
 */
export class ValidationError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
  }

  static invalidComponentAddress(address: any) {
    return new ValidationError(`Invalid component address: ${address}`);
  }

  static invalidNftId(id: any) {
    return new ValidationError(`Invalid NFT ID: ${id}`);
  }

  static invalidNftIds() {
    return new ValidationError("Invalid NFT IDs array");
  }

  static invalidStateVersion(version: any) {
    return new ValidationError(`Invalid state version: ${version}`);
  }

  static invalidPriceBounds() {
    return new ValidationError(
      "Invalid price bounds. Must be [lowerMultiplier, upperMultiplier] where lowerMultiplier > 0 and lowerMultiplier < upperMultiplier"
    );
  }

  static invalidMiddlePrice() {
    return new ValidationError(
      "Invalid middle price. Must be a positive number"
    );
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends BaseError {
  constructor(
    message: string,
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message, "NETWORK_ERROR", statusCode, details);
  }

  static requestFailed(message: string, statusCode?: number): NetworkError {
    return new NetworkError(message, statusCode);
  }

  static timeout(operation: string): NetworkError {
    return new NetworkError(`Operation timed out: ${operation}`, 408);
  }
}

/**
 * Data-related errors
 */
export class DataError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "DATA_ERROR", 422, details);
  }

  static notFound(type: string, id: string): DataError {
    return new DataError(`${type} not found: ${id}`, { type, id });
  }

  static invalidFormat(
    type: string,
    details?: Record<string, unknown>
  ): DataError {
    return new DataError(`Invalid ${type} format`, details);
  }

  static stateVersionTooHigh(version: number): DataError {
    return new DataError(
      "State version is beyond the end of the known ledger",
      { version }
    );
  }

  static missingData(type: string, field: string): DataError {
    return new DataError(`Missing ${type} data: ${field}`, { type, field });
  }
}

/**
 * Component-specific errors
 */
export class ComponentError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "COMPONENT_ERROR", 422, details);
  }

  static notC9Component(address: string): ComponentError {
    return new ComponentError("Not a C9 component", { address });
  }

  static invalidState(
    address: string,
    details?: Record<string, unknown>
  ): ComponentError {
    return new ComponentError("Invalid component state", {
      address,
      ...details,
    });
  }

  static missingField(address: string, field: string): ComponentError {
    return new ComponentError(`Missing component field: ${field}`, {
      address,
      field,
    });
  }
}

/**
 * NFT-related errors
 */
export class NFTError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "NFT_ERROR", 422, details);
  }

  static invalidClaims(nftId: string): NFTError {
    return new NFTError("Invalid or missing liquidity claims", { nftId });
  }

  static notFound(nftId: string): NFTError {
    return new NFTError("NFT not found", { nftId });
  }
}
