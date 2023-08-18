import ApiError from './ApiError';

class ApiResult<T = void, E = ApiError> {
  private _isSuccess: boolean;
  private result: T | E;

  constructor(isSuccess: boolean, value: T | E) {
    this._isSuccess = isSuccess;
    this.result = value;
  }

  static success<T>(value: T): ApiResult<T> {
    return new ApiResult<T>(true, value);
  }
  static error<E>(error: E): ApiResult<E> {
    return new ApiResult<E>(false, error);
  }

  public get ok(): boolean {
    return this._isSuccess;
  }

  get value(): T {
    return this.result as T;
  }

  get error(): E {
    return this.result as E;
  }
}

export default ApiResult;
