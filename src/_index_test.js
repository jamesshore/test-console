// Copyright (c) 2014-2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

const assert = require("chai").assert;
const stdout = require("./index.js").stdout;
const stderr = require("./index.js").stderr;

describe("'synchronous' inspect", function() {

	it("calls passed-in function synchronously", function() {
		let fnCalled = false;
		let inspectReturned = false;
		stdout.inspectSync((output) => {
			fnCalled = true;
			assert.isFalse(inspectReturned, "function should be called before inspect call returns");
		});
		inspectReturned = true;
		assert.isTrue(fnCalled, "function should have been called");
	});

	it("fails nicely when user forgets to pass in a function", () => {
		const errMsg = "inspectSync() requires a function parameter. Did you mean to call inspect()?";
		assert.throws(() => {
			stdout.inspectSync();
		}, errMsg);
		assert.throws(() => {
			stdout.inspectSync({});
		}, errMsg);
	});

	it("provides writes to passed-in function", function() {
		stdout.inspectSync((output) => {
			assert.deepEqual(output, [], "nothing written");

			process.stdout.write("foo");
			assert.deepEqual(output, ["foo"], "one call to stdout.write()");

			process.stdout.write("bar");
			process.stdout.write("baz");
			assert.deepEqual(output, ["foo", "bar", "baz"], "multiple calls to stdout.write()");
		});
	});

	it("supports console.log", function() {
		stdout.inspectSync((output) => {
			console.log("quux");
			assert.deepEqual(output, ["quux\n"], "console.log()");
		});
	});

	it("prevents output to console", function() {
		// This is a bit weird. We're going to assume inspectSync() works and use it to test inspectSync(). Inception!
		stdout.inspectSync((output) => {
			stdout.inspectSync(() => {
				console.log("foo");
			});
			assert.deepEqual(output, [], "console should be suppressed");
		});
	});

	it("mocks isTTY value", function() {
		const originalIsTTY = process.stdout.isTTY;
		stdout.inspectSync({ isTTY: !originalIsTTY }, () => {
			assert.equal(process.stdout.isTTY, !originalIsTTY, 'isTTY should be changed');
		});
		assert.equal(process.stdout.isTTY, originalIsTTY, 'isTTY should be restored');
	});

	it("uses existing isTTY value by default", () => {
		// Testing for various argument lists
		const originalIsTTY = process.stdout.isTTY;
		stdout.inspectSync(() => {
			assert.equal(process.stdout.isTTY, originalIsTTY, 'isTTY should not be changed');
		});
		stdout.inspectSync({}, () => {
			assert.equal(process.stdout.isTTY, originalIsTTY, 'isTTY should not be changed');
		});

		// testing for both original values of isTTY for failure modes that don't occur for both isTTY=false and isTTY=true
		stdout.inspectSync({ isTTY: true }, () => {
			stdout.inspectSync(() => {
				assert.equal(process.stdout.isTTY, true, 'isTTY should still be true if original value was true');
			});
		});

		stdout.inspectSync({ isTTY: false }, () => {
			stdout.inspectSync(() => {
				assert.equal(process.stdout.isTTY, false, 'isTTY should still be false if original value was false');
			});
		});
	});

	it("restores old behavior when done", function() {
		// More inception!
		stdout.inspectSync((output) => {
			const originalIsTTY = process.stdout.isTTY;
			stdout.inspectSync({ isTTY: !originalIsTTY }, () => {
				// this space intentionally left blank
			});
			console.log("foo");
			assert.deepEqual(output, ["foo\n"], "console should be restored");
			assert.equal(process.stdout.isTTY, originalIsTTY, 'isTTY should be restored');
		});
	});

	it("restores old behavior even when an exception occurs", function() {
		// inception!
		stdout.inspectSync((output) => {
			const originalIsTTY = process.stdout.isTTY;
			let exceptionPropagated = false;
			try {
				stdout.inspectSync({ isTTY: !process.stdout.isTTY }, () => {
					throw new Error("intentional exception");
				});
			}
			catch(err) {
				exceptionPropagated = true;
			}
			assert.isTrue(exceptionPropagated, "exception should be propagated");
			console.log("foo");
			assert.deepEqual(output, ["foo\n"], "console should be restored");
			assert.equal(process.stdout.isTTY, originalIsTTY, 'isTTY should be restored');
		});
	});

	it("also returns output", function() {
		const output = stdout.inspectSync(() => {
			console.log("foo");
		});
		assert.deepEqual(output, ["foo\n"], "returned output");
	});
});


describe("'asynchronous' inspect", function() {

	it("awaits passed-in function", async function() {
		let fnCalled = false;
		let inspectReturned = false;
		await stdout.inspectAsync(async function(output) {
			await tickAsync();
			fnCalled = true;
			assert.isFalse(inspectReturned, "function should be called before inspect call returns");
		});
		inspectReturned = true;
		assert.isTrue(fnCalled, "function should have been called");
	});

	it("fails nicely when user forgets to pass in a function", async function() {
		const errMsg = "inspectAsync() requires a function parameter. Did you mean to call inspect()?";
		await assertThrowsAsync(async () => {
			await stdout.inspectAsync();
		}, errMsg);
		await assertThrowsAsync(async () => {
			await stdout.inspectAsync({});
		}, errMsg);
	});

	it("provides writes to passed-in function", async function() {
		await stdout.inspectAsync(async (output) => {
			process.stdout.write("foo");
			assert.deepEqual(output, ["foo"], "one call to stdout.write()");
		});
	});

	it("restores old behavior when done", async function() {
		await stdout.inspectAsync(async (output) => {
			await stdout.inspectAsync(async () => {
				// this space intentionally left blank
			});
			console.log("foo");
			assert.deepEqual(output, ["foo\n"], "console should be restored");
		});
	});

	it("restores old behavior even when an exception occurs", async function() {
		await stdout.inspectAsync(async (output) => {
			let exceptionPropagated = false;
			try {
				await stdout.inspectAsync(async () => {
					throw new Error("intentional exception");
				});
			}
			catch(err) {
				exceptionPropagated = true;
			}
			assert.isTrue(exceptionPropagated, "exception should be propagated");
			console.log("foo");
			assert.deepEqual(output, ["foo\n"], "console should be restored");
		});
	});

	it("also returns output", async function() {
		const output = await stdout.inspectAsync(async () => {
			console.log("foo");
		});
		assert.deepEqual(output, ["foo\n"], "returned output");
	});

});


describe("neutral inspect", function() {

	it("fails nicely when user confuses it for inspectSync and passes in a function", function() {
		const errMsg = "inspect() doesn't take a function parameter. Did you mean to call inspectSync()?";
		assert.throws(() => {
			stdout.inspect(() => {});
		}, errMsg);
		assert.throws(() => {
			stdout.inspect({}, () => {});
		}, errMsg);
	});

	it("is like synchronous version, except you have to restore it manually", function() {
		const inspect = stdout.inspect();
		console.log("foo");
		assert.deepEqual(inspect.output, ["foo\n"], "output");
		inspect.restore();
	});

	it("emits 'data' event when data written", function() {
		const inspect = stdout.inspect();
		const data = [];
		inspect.on("data", (string) => {
			data.push(string);
		});
		console.log("foo");
		inspect.restore();
		assert.deepEqual(data, ["foo\n"], "chunk should be emitted");
	});

	it("prevents output to console until restored", function() {
		// inception!
		stdout.inspectSync((output) => {
			const inspect = stdout.inspect();

			console.log("foo");
			assert.deepEqual(output, [], "console should be suppressed");

			inspect.restore();
			console.log("bar");
			assert.deepEqual(output, ["bar\n"], "console should be restored");
		});
	});

});


describe("'synchronous' ignore", function() {

	it("fails nicely when user forgets to pass in a function", function() {
		assert.throws(() => {
			stdout.ignoreSync();
		}, "ignoreSync() requires a function parameter. Did you mean to call ignore()?");
	});

	it("simply disables output to console", function() {
		let fnRan = false;

		// We'll use inspect() to make sure ignore() works. Inception! (Okay, that joke's getting old. Too bad! Mwahaha!)
		stdout.inspectSync((output) => {
			stdout.ignoreSync(() => {
				console.log("foo");
				fnRan = true;
			});
			assert.equal(fnRan, true, "should have ran function");
			assert.deepEqual(output, [], "console should be ignored");
			console.log("bar");
			assert.deepEqual(output, ["bar\n"], "console should be restored");
		});
	});

	it("doesn't provide any parameters", function() {
		stdout.ignoreSync(() => {
			assert.equal(arguments.length, 0, "# of arguments");
		});
	});

});


describe("'asynchronous' ignore", function() {

	it("fails nicely when user forgets to pass in a function", async function() {
		await assertThrowsAsync(async () => {
			await stdout.ignoreAsync();
		}, "ignoreAsync() requires a function parameter. Did you mean to call ignore()?");
	});

	it("simply disables output to console, and works with async function", async function() {
		let fnRan = false;

		await stdout.inspectAsync(async (output) => {
			await stdout.ignoreAsync(async () => {
				await tickAsync();
				console.log("foo");
				fnRan = true;
			});
			assert.equal(fnRan, true, "should have ran or awaited function");
			assert.deepEqual(output, [], "console should be ignored");
			console.log("bar");
			assert.deepEqual(output, ["bar\n"], "console should be restored");
		});
	});

	it("doesn't provide any parameters", async function() {
		await stdout.ignoreAsync(async () => {
			assert.equal(arguments.length, 0, "# of arguments");
		});
	});

});


describe("neutral ignore", function() {

	it("fails nicely when user confuses it for ignoreSync and passes in a function", function() {
		assert.throws(() => {
			stdout.ignore(() => {});
		}, "ignore() doesn't take a function parameter. Did you mean to call ignoreSync()?");
	});

	it("is like synchronous version, except you have to restore it manually", function() {
		// inception!
		stdout.inspectSync((output) => {
			const restore = stdout.ignore();

			console.log("foo");
			assert.deepEqual(output, [], "console should be suppressed");

			restore();
			console.log("bar");
			assert.deepEqual(output, ["bar\n"], "console should be restored");
		});
	});

});


describe("stderr", function() {

	it("has everything stdout does, only for stderr", function() {
		assert.isDefined(stderr.inspect, "inspect");
		assert.isDefined(stderr.inspectSync, "inspectSync");
		assert.isDefined(stderr.ignore, "ignore");
		assert.isDefined(stderr.ignoreSync, "ignoreSync");
	});

	it("actually works", function() {
		const inspect = stderr.inspect();
		process.stderr.write("foo");
		assert.deepEqual(inspect.output, ["foo"], "output");
		inspect.restore();
	});

});



async function tickAsync() {
	await new Promise((resolve) => {
		setImmediate(resolve);
	});
}

async function assertThrowsAsync(fnAsync, expectedRegexOrExactString, message) {
	message = message ? `${message}: ` : "";
	try {
		await fnAsync();
	}
	catch (err) {
		if (expectedRegexOrExactString === undefined) return;
		if (typeof expectedRegexOrExactString === "string") {
			assert.equal(err.message, expectedRegexOrExactString, message);
		}
		else {
			assert.matches(err.message, expectedRegexOrExactString, message);
		}
		return;
	}
	assert.fail(`${message}Expected exception: ${expectedRegexOrExactString}`);
}
