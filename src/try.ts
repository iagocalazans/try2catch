import { typeOf } from "./type-of";

/**
 * Provides an organized and simple way to handle outcomes without wrapping every
 * call site in try/catch, returning settlements as positional tuples.
 */
export class Try {
  /**
   * Resolves the runtime type tag of a value.
   *
   * @param value - The value to inspect.
   * @returns The type name of the value.
   */
  static typeOf(value: unknown): string {
    return typeOf(value);
  }

  /**
   * Runs a Promise and captures its settlement as a positional tuple, removing the
   * need to wrap the call site in try/catch.
   *
   * Position 0 holds the resolved value and position 1 holds the rejection reason;
   * exactly one of them is non-null on every settlement.
   *
   * @typeParam D - The type resolved by the Promise.
   * @param promise - The Promise whose outcome will be captured.
   * @returns `[value, null]` when it resolves, or `[null, reason]` when it rejects.
   *
   * @example
   * ```typescript
   * const [user, error] = await Try.promise(fetchUser(id));
   *
   * if (error) {
   *   return error;
   * }
   *
   * return user;
   * ```
   */
  static async promise<D>(
    promise: Promise<D>,
  ): Promise<[D, null] | [null, unknown]> {
    try {
      return [await promise, null];
    } catch (err) {
      return [null, err];
    }
  }

  /**
   * Runs many Promises in parallel and partitions their outcomes without ever rejecting.
   *
   * @typeParam D - The type resolved by each Promise.
   * @param promises - The Promises to settle in parallel.
   * @returns `[values, reasons]`: resolved values in position 0, rejection reasons in position 1.
   *
   * @example
   * ```typescript
   * const [values, reasons] = await Try.settled([fetchA(), fetchB()]);
   * ```
   */
  static async settled<D>(
    promises: Promise<D>[],
  ): Promise<[D[], unknown[]]> {
    const results = await Promise.allSettled(promises);

    const values: D[] = [];
    const reasons: unknown[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        values.push(result.value);
      } else {
        reasons.push(result.reason);
      }
    }

    return [values, reasons];
  }
}
