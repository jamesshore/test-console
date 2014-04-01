// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("chai").assert;
var stdout = require("./index.js").stdout;
var stderr = require("./index.js").stderr;

describe("inspect", function() {

	it("calls passed-in function synchronously", function() {
		var fnCalled = false;
		var inspectReturned = false;
		stdout.inspectSync(function(output) {
			fnCalled = true;
			assert.isFalse(inspectReturned, "function should be called before inspect call returns");
		});
		inspectReturned = true;
		assert.isTrue(fnCalled, "function should have been called");
	});

	it("provides writes to passed-in function", function() {
		stdout.inspectSync(function(output) {
			assert.deepEqual(output, [], "nothing written");

			process.stdout.write("foo");
			assert.deepEqual(output, ["foo"], "one call to stdout.write()");

			process.stdout.write("bar");
			process.stdout.write("baz");
			assert.deepEqual(output, ["foo", "bar", "baz"], "multiple calls to stdout.write()");
		});
	});

	it("supports console.log", function() {
		stdout.inspectSync(function(output) {
			console.log("quux");
			assert.deepEqual(output, ["quux\n"], "console.log()");
		});
	});

	it("prevents output to console", function() {
		// This is a bit weird. We're going to assume inspectSync() works and use it to test inspectSync(). Inception!
		stdout.inspectSync(function(output) {
			stdout.inspectSync(function() {
				console.log("foo");
			});
			assert.deepEqual(output, [], "console should be suppressed");
		});
	});

	it("restores old behavior when done", function() {
		// More inception!
		stdout.inspectSync(function(output) {
			stdout.inspectSync(function() {
				// this space intentionally left blank
			});
			console.log("foo");
			assert.deepEqual(output, [ "foo\n" ], "console should be restored");
		});
	});

	it("restores old behavior even when an exception occurs", function() {
		// inception!
		stdout.inspectSync(function(output) {
			var exceptionPropagated = false;
			try {
				stdout.inspectSync(function() {
					throw new Error("intentional exception");
				});
			}
			catch (err) {
				exceptionPropagated = true;
			}
			assert.isTrue(exceptionPropagated, "exception should be propagated");
			console.log("foo");
			assert.deepEqual(output, [ "foo\n" ], "console should be restored");
		});
	});

	it("also returns output", function() {
		var output = stdout.inspectSync(function() {
			console.log("foo");
		});
		assert.deepEqual(output, [ "foo\n" ], "returned output");
	});
});


describe("'asynchronous' inspect", function() {

	it("is like synchronous version, except you have to restore it manually", function() {
		var inspect = stdout.inspect();
		console.log("foo");
		assert.deepEqual(inspect.output, [ "foo\n" ], "output");
		inspect.restore();
	});

	it("prevents output to console until restored", function() {
		// inception!
		stdout.inspectSync(function(output) {
			var inspect = stdout.inspect();

			console.log("foo");
			assert.deepEqual(output, [], "console should be suppressed");

			inspect.restore();
			console.log("bar");
			assert.deepEqual(output, [ "bar\n" ], "console should be restored");
		});
	});

});


describe("ignore", function() {

	it("simply disables output to console", function() {
		// We'll use inspect() to make sure ignore() works. Inception! (Okay, that joke's getting old. Too bad! Mwahaha!)
		stdout.inspectSync(function(output) {
			stdout.ignoreSync(function() {
				console.log("foo");
			});
			assert.deepEqual(output, [], "console should be ignored");
			console.log("bar");
			assert.deepEqual(output, [ "bar\n" ], "console should be restored");
		});
	});

	it("doesn't provide any parameters", function() {
		stdout.ignoreSync(function() {
			assert.equal(arguments.length, 0, "# of arguments");
		});
	});

});


describe("'asynchronous' ignore", function() {

	it("is like synchronous version, except you have to restore it manually", function() {
		// inception!
		stdout.inspectSync(function(output) {
			var restore = stdout.ignore();

			console.log("foo");
			assert.deepEqual(output, [], "console should be suppressed");

			restore();
			console.log("bar");
			assert.deepEqual(output, [ "bar\n" ], "console should be restored");
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
		var inspect = stderr.inspect();
		process.stderr.write("foo");
		assert.deepEqual(inspect.output, [ "foo" ], "output");
		inspect.restore();
	});

});