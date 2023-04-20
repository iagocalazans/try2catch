/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { typeOf } from "./type-of";

/**
 * The Try class provides an organized and simple way to return errors without having to wrap every request in Try/Catches.
 */
export class Try<D> {
  /**
   * Stores the success return object as #data.
   */
  protected readonly _value?: D;

  protected readonly _isError: boolean

  protected constructor(data: D, isError = false) {
    this._value = data;
    this._isError = isError
    return this;
  }

  /**
   * 
   * @param value 
   * @returns The type of the value.
   */
  static typeOf(value: unknown) {
    return typeOf(value);
  }

  /**
   * 
   * @param promise
   * @returns A Class of type TryThen or TryCatch that holds the resolved or rejected value from Promise.
   */
  static async promise<D>(promise: Promise<D>) {
    try {
      return new TryThen<D>(await Promise.resolve(promise));
    } catch (err: any) {
      return new TryCatch<any>(err);
    }
  }

  /**
   * 
   * @returns True when the Promise rejects and false when it resolves.
   */
  protected isError() {
    return this._isError
  }
}

class TryThen<D> extends Try<D> {
  /**
   * @returns The Promise resolved value.
   */
  get data() {
    if (this._isError) {
      throw new Error('This is not a successfull request. Result with error type instead.');
    }

    return this._value;
  }

  isError(): this is TryCatch<D> {
    return this._isError
  }
}

class TryCatch<D> extends Try<D> {
  constructor(data: D) {
    super(data, true)
    return this;
  }

  /**
   * @returns The Promise rejected error value.
   */
  get error() {
    if (!this._isError) {
      throw new Error('This is a successfull request. Result with data type instead.');
    }

    return this._value;
  }

  isError(): this is TryCatch<D> {
    return this._isError
  }
}