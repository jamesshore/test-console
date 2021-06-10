// Copyright (c) 2014-2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";
const EventEmitter = require("events");

class TestStream {

	constructor(stream) {
		this._stream = stream;
	}

	inspect(options) {
		expectNoFunction(arguments, "inspect", "inspectSync");

		let isTTY;
		if (options && options.isTTY !== undefined) {
			isTTY = options.isTTY;
		}

		// This code inspired by http://userinexperience.com/?p=714
		const output = [];
		const stream = this._stream;
		const res = new EventEmitter();

		const originalWrite = stream.write;
		stream.write = (string) => {
			output.push(string);
			res.emit("data", string);
		};

		const originalIsTTY = stream.isTTY;
		if (isTTY !== undefined) {
			stream.isTTY = isTTY;
		}

		res.output = output;
		res.restore = () => {
			stream.write = originalWrite;
			stream.isTTY = originalIsTTY;
		};
		return res;
	}

	inspectSync(options, fn) {
		expectFunction(arguments, "inspectSync", "inspect");
		[ options, fn ] = normalizeArgs(options, fn);

		const inspect = this.inspect(options);
		try {
			fn(inspect.output);
		}
		finally {
			inspect.restore();
		}
		return inspect.output;
	}

	async inspectAsync(options, fnAsync) {
		expectFunction(arguments, "inspectAsync", "inspect");
		[ options, fnAsync ] = normalizeArgs(options, fnAsync);

		const inspect = this.inspect(options);
		try {
			await fnAsync(inspect.output);
		}
		finally {
			inspect.restore();
		}
		return inspect.output;
	}

	ignore(options) {
		expectNoFunction(arguments, "ignore", "ignoreSync");

		return this.inspect(options).restore;
	}

	ignoreSync(options, fn) {
		expectFunction(arguments, "ignoreSync", "ignore");
		[ options, fn ] = normalizeArgs(options, fn);

		this.inspectSync(options, () => {
			fn();
		});
	}

	async ignoreAsync(options, fnAsync) {
		expectFunction(arguments, "ignoreAsync", "ignore");
		[ options, fnAsync ] = normalizeArgs(options, fnAsync);

		await this.inspectAsync(options, async () => {
			await fnAsync();
		});
	}

}

exports.stdout = new TestStream(process.stdout);
exports.stderr = new TestStream(process.stderr);


function expectNoFunction(args, calledFunction, functionToCallInstead) {
	if (args.length && typeof args[0] === 'function' || args.length > 1) {
		throw new Error(calledFunction + "() doesn't take a function parameter. Did you mean to call " +
			functionToCallInstead + "()?");
	}
}

function expectFunction(args, calledFunction, functionToCallInstead) {
	if (args.length === 0 || args.length > 2 || typeof args[args.length - 1] !== 'function') {
		throw new Error(calledFunction + "() requires a function parameter. Did you mean to call " +
			functionToCallInstead + "()?");
	}
}

function normalizeArgs(options, fn) {
	if (fn === undefined) {
		fn = options;
		options = {};
	}
	return [ options, fn ];
}
