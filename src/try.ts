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
   * The reason slot is constrained to a non-nullish type (defaulting to `Error`)
   * so the tuple behaves as a discriminated union. After destructuring, a truthiness
   * check on the reason narrows the value slot from `D | null` down to `D`, which lets
   * an early `throw`/`return` on the error branch leave a non-null value behind.
   *
   * @typeParam D - The type resolved by the Promise.
   * @typeParam E - The rejection reason type. Must be non-nullish to preserve narrowing.
   * @param promise - The Promise whose outcome will be captured.
   * @returns `[value, null]` when it resolves, or `[null, reason]` when it rejects.
   *
   * @example
   * ```typescript
   * const [user, error] = await Try.promise(fetchUser(id));
   *
   * if (error) {
   *   throw error;
   * }
   *
   * return user;
   * ```
   */
  static async promise<D, E extends NonNullable<unknown> = Error>(
    promise: Promise<D>,
  ): Promise<[D, null] | [null, E]> {
    try {
      return [await promise, null];
    } catch (err) {
      return [null, err as E];
    }
  }

  /**
   * Runs many Promises in parallel and partitions their outcomes without ever rejecting.
   *
   * Each partition preserves the original position of its Promise as the first element
   * of an `[index, value]` (or `[index, reason]`) pair, so a settlement can be traced
   * back to the Promise that produced it even after the outcomes are split apart.
   *
   * @typeParam D - The type resolved by each Promise.
   * @param promises - The Promises to settle in parallel.
   * @returns `[values, reasons]`: resolved settlements as `[index, value]` pairs in position 0,
   * rejected settlements as `[index, reason]` pairs in position 1.
   *
   * @example
   * ```typescript
   * const [values, reasons] = await Try.settled([fetchA(), fetchB()]);
   *
   * for (const [index, value] of values) {
   *   console.log(`Promise ${index} resolved with`, value);
   * }
   * ```
   */
  static async settled<D>(
    promises: Promise<D>[],
  ): Promise<[[number, Awaited<D>][], [number, unknown][]]> {
    const results = await Promise.allSettled(promises);

    const values: [number, Awaited<D>][] = [];
    const reasons: [number, unknown][] = [];

    const { values: v, reasons: r } = results.reduce(
      (pv, cv, i) => {
        if (cv.status === "fulfilled") {
          pv.values.push([i, cv.value]);
        } else {
          pv.reasons.push([i, cv.reason]);
        }

        return pv;
      },
      { values, reasons },
    );

    return [v, r];
  }
}
