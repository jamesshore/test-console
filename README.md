# test-console

A simple and pragmatic library for testing Node.js console output.


## Example

See the API section for more examples.

```javascript
var stdout = require("test-console").stdout;

var output = stdout.inspectSync(function() {
    console.log("foo");
});
assert.deepEqual(output, [ "foo\n "]);
```

## Installation

This is a Node.js library. Install Node, then:

`npm install test-console` (add `--save` or `--save-dev` if you want)

To use the library in your code, require it as follows:

```javascript
var stdout = require("test-console").stdout;
var stderr = require("test-console").stderr;
```


## API

* `stdout.inspect`: Redirects writes to `stdout` into an array instead of writing them to console.
* `stdout.inspectSync`: Just like `inspect()`, but automatically restores the console when done.
* `stdout.ignore`: Prevent writes to `stdout` from appearing on the console.
* `stdout.ignoreSync`: Just like `ignore()`, but automatically restores the console when done.

The same API is also available on `stderr`.


### `inspect = stdout.inspect()`

Redirects writes to `stdout` into an array instead of writing them to the console.

* `inspect`: Returned as an object with two properties:
  * `inspect.output`: An array containing one string for each call to `stdout.write()`. This array updates every time another call to `stdout.write()` is made.
  * `inspect.restore()`: Call this function to restore stdout.write to its normal behavior.

Example of using `inspect()` to test a synchronous function:

```javascript
var inspect = stdout.inspect();
functionUnderTest();
inspect.restore();
assert.deepEqual(inspect.output, [ "foo\n" ]);
```

Example of using `inspect()` to test an asynchronous function:

```javascript
var inspect = stdout.inspect();
functionUnderTest(function() {
    inspect.restore();
    assert.deepEqual(inspect.output, [ "foo\n" ]);
});
```


### `output = stdout.inspectSync(fn)`

Just like `inspect()`, but automatically restores the console when done.

* `fn(output)`: The function to run while inspecting stdout. After the function returns, stdout.write is automatically restored. Note that `output` is passed into this function in addition to being returned from `inspectSync()`.

* `output`: Passed into `fn` and also returned as an array containing one string for each call to `stdout.write()`. This array updates every time another call to `stdout.write()` is made.

Example of using `inspectSync()` to test a synchronous function:

```javascript
var output = stdout.inspectSync(function() {
    functionUnderTest();
});
assert.deepEqual(output, [ "foo\n" ]);
```

Example of using `inspectSync() to incrementally test several synchronous functions:

```javascript
stdout.inspectSync(function(output) {
    functionUnderTest();
    assert.deepEqual(output, [ "foo\n" ]);
    anotherFunctionUnderTest();
    assert.deepEqual(output, [ "foo\n", "bar\n" ]);
});
```


### `restore = stdout.ignore()`

Prevent writes to `stdout` from appearing on the console.

* `restore()`: Call this function to restore stdout.write to its normal behavior.

Example of using `ignore()` to prevent a synchronous function from writing to the console:

```javascript
var restore = stdout.ignore();
functionUnderTest();
restore();
```

Example of using `ignore()` to prevent an asynchronous function from writing to the console:

```javascript
var restore = stdout.ignore();
functionUnderTest(function() {
    restore();
});
```

Example of using `ignore()` to prevent a suite of tests from writing to the console:

```javascript
var restoreStdout;

beforeEach(function() {
    restoreStdout = stdout.ignore();
};

afterEach(function() {
    restoreStdout();
};

// tests go here
```


### `ignoreSync(fn)`

Just like `ignore()`, but automatically restores the console when done.

* `fn()`: The function to run while ignoring stdout. After the function returns, stdout.write is automatically restored.

Example of using `ignoreSync()` to prevent a synchronous function from writing to the console:

```javascript
stdout.ignore(function() {
    functionUnderTest();
});
```


## Version History

__0.7.1:__ Bug fix: Sync() versions restore old behavior even if exception occurs

__0.7.0:__ Initial release: `inspect()`, `inspectSync()`, `ignore()`, and `ignoreSync()`


## Contributors

Created by James Shore. Inspired by Brandon Satrom's [Automated Testing of Standard Output in Node.js](http://userinexperience.com/?p=714).



## License

The MIT License (MIT)

Copyright (c) 2014 James Shore

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

