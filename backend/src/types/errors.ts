export abstract class BaseError extends Error {
  abstract readonly code: string;
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class RecordError extends BaseError {
    readonly code = "ERROR";
}

// Database Layer Errors
export class RecordNotFoundError extends BaseError {
  readonly code = 'NOT_FOUND';
  constructor(entity: string, id: string) {
    super(`${entity} with ID ${id} was not found.`);
  }
}

export class DatabaseConnectionError extends BaseError {
  readonly code = 'DB_CONN_ERROR';
}