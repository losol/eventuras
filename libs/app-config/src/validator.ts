import { EnvVarDefinition, EnvVarType } from './types.js';

/**
 * Validation error class
 */
export class EnvValidationError extends Error {
  constructor(
    message: string,
    public varName: string,
    public definition?: EnvVarDefinition
  ) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * Parse and validate an environment variable value based on its type
 */
export function parseEnvValue(
  varName: string,
  rawValue: string | undefined,
  definition: EnvVarDefinition
): unknown {
  // Handle missing values
  if (rawValue === undefined || rawValue === '') {
    if (definition.required && definition.default === undefined) {
      throw new EnvValidationError(
        `Required environment variable "${varName}" is not set.\n` +
          `Description: ${definition.description}`,
        varName,
        definition
      );
    }
    return definition.default;
  }

  // Validate enum
  if (definition.enum && !definition.enum.includes(rawValue)) {
    throw new EnvValidationError(
      `Environment variable "${varName}" must be one of: ${definition.enum.join(', ')}.\n` +
        `Got: "${rawValue}"`,
      varName,
      definition
    );
  }

  // Validate pattern
  if (definition.pattern) {
    const regex = new RegExp(definition.pattern);
    if (!regex.test(rawValue)) {
      throw new EnvValidationError(
        `Environment variable "${varName}" does not match pattern: ${definition.pattern}.\n` +
          `Got: "${rawValue}"`,
        varName,
        definition
      );
    }
  }

  // Type conversion and validation
  switch (definition.type) {
    case 'string':
      return rawValue;

    case 'url':
      try {
        new URL(rawValue);
        return rawValue;
      } catch {
        throw new EnvValidationError(
          `Environment variable "${varName}" must be a valid URL.\n` + `Got: "${rawValue}"`,
          varName,
          definition
        );
      }

    case 'int': {
      const intValue = parseInt(rawValue, 10);
      if (isNaN(intValue)) {
        throw new EnvValidationError(
          `Environment variable "${varName}" must be a valid integer.\n` + `Got: "${rawValue}"`,
          varName,
          definition
        );
      }
      return intValue;
    }

    case 'bool': {
      const lowerValue = rawValue.toLowerCase();
      if (lowerValue === 'true' || lowerValue === '1') return true;
      if (lowerValue === 'false' || lowerValue === '0') return false;
      throw new EnvValidationError(
        `Environment variable "${varName}" must be a boolean (true/false, 1/0).\n` +
          `Got: "${rawValue}"`,
        varName,
        definition
      );
    }

    case 'json':
      try {
        return JSON.parse(rawValue);
      } catch {
        throw new EnvValidationError(
          `Environment variable "${varName}" must be valid JSON.\n` + `Got: "${rawValue}"`,
          varName,
          definition
        );
      }

    default: {
      const _exhaustive: never = definition.type;
      throw new Error(`Unknown type: ${_exhaustive}`);
    }
  }
}

/**
 * Get the TypeScript type string for an environment variable type
 */
export function getTypeString(type: EnvVarType): string {
  switch (type) {
    case 'string':
    case 'url':
      return 'string';
    case 'int':
      return 'number';
    case 'bool':
      return 'boolean';
    case 'json':
      return 'unknown';
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unknown type: ${_exhaustive}`);
    }
  }
}
