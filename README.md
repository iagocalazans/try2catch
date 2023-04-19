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
    const result = await Try.promise(awaiter)

    if (result.isError()) {
        return result.error;
    }

    return result.data
}
```

In this example, `Try.promise()` takes a Promise as an argument and returns an object with two properties: `isError` and `data`. If the Promise resolves successfully, `isError` will be `false` and `data` will contain the resolved value. If the Promise is rejected, `isError will` be `true` and `data` will contain the error object.

## License

This package is licensed under the MIT license. See the LICENSE file for more details.
