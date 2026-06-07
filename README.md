# Try2Catch

A better try/catch like way to get your errors encapsulated.

## Installation

You can install Try2Catch using `npm` or `yarn`:

```bash
npm install try2catch
```

```bash
yarn add try2catch
```

## Usage

To use Try2Catch, import the Try object from the package:

```javascript
import { Try } from 'try2catch';
```

Create a Promise that resolves or rejects after some time, for example:

```javascript
const awaiter = new Promise((res, reject) => {
    const random = (Math.random() * 10) + 1
    setTimeout(() => { 
            if (random > 5) {
                return res('Nice!');
            }
        
            return reject(new Error('Failed!'));
        }, 5000);
});
```

An asynchronous function that uses Try to handle the Promise's result:

```javascript
const processing = async () => {
    const [data, error] = await Try.promise(awaiter)

    if (error) {
        return error;
    }

    return data
}
```

In this example, `Try.promise()` takes a Promise as an argument and returns a positional tuple `[data, error]`. If the Promise resolves successfully, position 0 holds the resolved value and position 1 is `null`. If the Promise is rejected, position 0 is `null` and position 1 holds the rejection reason. Exactly one of the two positions is non-null on every settlement.

### Settling many Promises

`Try.settled()` runs an array of Promises in parallel and partitions the outcomes without ever rejecting, returning a `[values, reasons]` tuple:

```javascript
const [values, reasons] = await Try.settled([fetchA(), fetchB(), fetchC()]);
```

`values` collects every resolved settlement and `reasons` collects every rejection, each as an `[index, value]` (or `[index, reason]`) pair. The index is the original position of the Promise in the input array, so an outcome can always be traced back to the call that produced it:

```javascript
const [values, reasons] = await Try.settled([fetchA(), fetchB(), fetchC()]);

for (const [index, value] of values) {
  console.log(`Promise ${index} resolved with`, value);
}

for (const [index, reason] of reasons) {
  console.error(`Promise ${index} rejected with`, reason);
}
```

### Inspecting types

`Try.typeOf()` returns the runtime type tag of any value:

```javascript
Try.typeOf([]);        // 'Array'
Try.typeOf(null);      // 'Null'
Try.typeOf(new Map()); // 'Map'
```

## Migrating from 1.x to 2.0

> **Breaking change:** `Try.promise()` no longer returns a wrapper object. It now returns a positional tuple `[data, error]`. The instance helpers `isError()`, `data`, and `error` were removed, along with the internal `TryThen` / `TryCatch` classes (which were never exported).

### What changed

- **Return shape:** `Try.promise()` returned a `TryThen` / `TryCatch` object in 1.x; in 2.0 it returns a `[data, error]` tuple.
- **Discrimination:** `result.isError()` is gone; check the second position instead with `if (error)`.
- **Success value:** `result.data` becomes the first position of the tuple.
- **Failure value:** `result.error` becomes the second position of the tuple.
- **New helper:** 2.0 adds `Try.settled()` for handling arrays of Promises in parallel.

### How to migrate

Replace the wrapper-object access with tuple destructuring.

**Before (1.x):**

```javascript
const result = await Try.promise(awaiter);

if (result.isError()) {
    return result.error;
}

return result.data;
```

**After (2.0):**

```javascript
const [data, error] = await Try.promise(awaiter);

if (error) {
    return error;
}

return data;
```

### Migration tips

- **Find every call site.** Search your codebase for `Try.promise` and for the `.isError()`, `.data`, and `.error` accessors that follow it.
- **Pick your variable names per call.** The tuple is positional, not named, so rename freely: `const [user, userError] = await Try.promise(...)`.
- **Mind TypeScript narrowing when destructuring.** Checking `error` does not narrow `data` to non-null, because they become independent variables. When you need `data` typed as non-null after an early return, assert it (`data!`) or guard with `if (!error)`.
- **Drop any imports of `TryThen` / `TryCatch`.** They were internal and are gone in 2.0; only `Try` is part of the public API.

## License

This package is licensed under the MIT license. See the LICENSE file for more details.
