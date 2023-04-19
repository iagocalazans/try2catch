/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { typeOf } from "./type-of";

/**
 * The Try class provides an organized and simple way to return errors without having to wrap every request in Try/Catches.
 */
export class Try<P> {
  /**
   * Stores the success return object as #data.
   */
  private _d?: P;

  /**
   * Stores the failed return object as #error.
   */
  private _e?: any;

  private constructor(error: Error | undefined, data?: P) {
    if (data instanceof Error) {
      this._e = data;
      return this;
    }

    this._d = data;
    this._e = error;
    return this;
  }

  /**
   *  The static function to create new Result objects with the sucessfull data object.
   *
   */
  static success<T>(data: T): Either<any, Try<T>> {
    return success(new Try(undefined, data));
  }

  static async promise<L, T>(promise: Promise<T>): Promise<Either<Try<Awaited<L>>, Try<Awaited<T>>>> {
    try {
      return success(new Try<Awaited<T>>(undefined, await Promise.resolve(promise)));
    } catch (err: any) {
      return failed(new Try<Awaited<L>>(err));
    }
  }

  /**
   *  The static function to create new Result objects with the failed error object.
   */
  static fail<T extends Error>(error: T): Either<Try<T>, any> {
    return failed(new Try(error));
  }

  /**
   * Retrieve the internal data object.
   */
  get data() {
    if (typeOf(this._e) !== 'Undefined') {
      throw new Error('This is not a successfull request. Result with error type instead.');
    }

    return this._d;
  }

  /**
   * Retrieve the internal error object.
   */
  get error() {
    if (typeOf(this._d) !== 'Undefined') {
      throw new Error('This is a successfull request. Result with data type instead.');
    }

    return this._e;
  }
}


export type Either<L extends Try<unknown>, A extends Try<unknown>> = Left<L, A> | Right<L, A>;

class Left<L extends Try<unknown>, A extends Try<unknown>> {
  private readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  get error() {
    return this.value.error
  }

  isError(): this is Left<L, A> {
    return true;
  }

  isOk(): this is Right<L, A> {
    return false;
  }
  
  /**
   * @deprecated
   */
  isLeft(): this is Left<L, A> {
    return true;
  }

  /**
   * @deprecated
   */
  isRight(): this is Right<L, A> {
    return false;
  }
}

class Right<L extends Try<unknown>, A extends Try<unknown>> {
  private readonly value: A;

  constructor(value: A) {
    this.value = value;
  }

  get data() {
    return this.value.data
  }

  isError(): this is Left<L, A>  {
    return false;
  }

  isOk(): this is Right<L, A> {
    return true;
  }

  /**
   * @deprecated
   */
  isLeft(): this is Left<L, A> {
    return false;
  }

  /**
   * @deprecated
   */
  isRight(): this is Right<L, A> {
    return true;
  }
}

const failed = <L extends Try<unknown>, A extends Try<unknown>>(l: L): Either<L, A> => {
  return new Left(l);
};

const success = <L extends Try<unknown>, A extends Try<unknown>>(a: A): Either<L, A> => {
  return new Right(a);
};