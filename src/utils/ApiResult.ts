class ApiResult<T, E> {
  private _isSuccess: boolean;
  private value?: T;
  private error?: E;

  constructor(isSuccess: boolean, value?: T, error?: E) {
    this._isSuccess = isSuccess;
    this.value = value;
    this.error = error;
  }

  static success<T>(value: T): ApiResult<T, undefined> {
    return new ApiResult<T, undefined>(true, value);
  }
  static error<E>(error: E): ApiResult<undefined, E> {
    return new ApiResult<undefined, E>(false, undefined, error);
  }

  public get isSuccess(): boolean {
    return this._isSuccess;
  }
  isFailure(): boolean {
    return !this._isSuccess;
  }
  getValue(): T | undefined {
    return this.value;
  }
  getError(): E | undefined {
    return this.error;
  }
}

export default ApiResult;
