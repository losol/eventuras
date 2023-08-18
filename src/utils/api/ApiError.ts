class ApiError extends Error {
  private _statusCode: number;
  private _statusText: string;
  constructor({
    message,
    statusCode,
    statusText,
  }: {
    message: string;
    statusCode: number;
    statusText: string;
  }) {
    super(message);
    this._statusCode = statusCode;
    this._statusText = statusText;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  public get statusCode() {
    return this._statusCode;
  }

  public get statusText() {
    return this._statusText;
  }
}

export default ApiError;
