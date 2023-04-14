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
  static success<T>(data: T): Either<undefined, Try<T>> {
    return right(new Try(undefined, data));
  }

  static async promise<T>(promise: Promise<T>): Promise<Either<any, Try<Awaited<T>>>> {
    try {
      if (promise instanceof Promise) {
        const data = await promise;
        return right(new Try(undefined, data));
      }

      return right(new Try(undefined, promise));
    } catch (err: any) {
      return left(new Try(err));
    }
  }

  /**
   *  The static function to create new Result objects with the failed error object.
   */
  static fail<T extends Error>(error: T): Either<Try<T>, undefined> {
    return left(new Try(error));
  }

  /**
   * Check the class type, if it has an error, or not
   */
  get isError(): boolean {
    return !!this._e;
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


export type Either<L, A> = Left<L, A> | Right<L, A>;

class Left<L, A> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isLeft(): this is Left<L, A> {
    return true;
  }

  isRight(): this is Right<L, A> {
    return false;
  }
}

class Right<L, A> {
  readonly value: A;

  constructor(value: A) {
    this.value = value;
  }

  isLeft(): this is Left<L, A> {
    return false;
  }

  isRight(): this is Right<L, A> {
    return true;
  }
}

const left = <L, A>(l: L): Either<L, A> => {
  return new Left(l);
};

const right = <L, A>(a: A): Either<L, A> => {
  return new Right<L, A>(a);
};

