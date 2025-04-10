export class ChatAPIError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(
    message: string,
    statusCodeOrDetails: number | unknown = 500,
    details?: unknown
  ) {
    super(message);
    this.name = 'ChatAPIError';
    
    // statusCodeOrDetails can be either a number (statusCode) or an object (details)
    if (typeof statusCodeOrDetails === 'number') {
      this.statusCode = statusCodeOrDetails;
      this.details = details;
    } else {
      this.statusCode = 500;
      this.details = statusCodeOrDetails;
    }
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}
