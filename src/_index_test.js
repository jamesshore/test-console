// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("chai").assert;
var stdout = require("./index.js").stdout;

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
			assert.deepEqual(output, [], "output should be suppressed");
		});
	});

	it("restores old behavior when done", function() {
		// More inception!
		stdout.inspectSync(function(output) {
			stdout.inspectSync(function() {
				// this space intentionally left blank
			});
			console.log("foo");
			assert.deepEqual(output, [ "foo\n" ], "output should be restored");
		});
	});

	//todo: provides async version

});
