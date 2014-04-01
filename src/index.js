// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

exports.stdout = new TestStream(process.stdout);
exports.stderr = new TestStream(process.stderr);

function TestStream(stream) {
	this._stream = stream;
}

TestStream.prototype.inspect = function() {
	// This code inspired by http://userinexperience.com/?p=714
	var output = [];
	var stream = this._stream;

	var originalWrite = stream.write;
	stream.write = function(string) {
		output.push(string);
	};

	return {
		output: output,
		restore: function() {
			stream.write = originalWrite;
		}
	};
};

TestStream.prototype.inspectSync = function(fn) {
	var inspect = this.inspect();
	try {
		fn(inspect.output);
	}
	finally {
		inspect.restore();
	}
	return inspect.output;
};

TestStream.prototype.ignore = function() {
	return this.inspect().restore;
};

TestStream.prototype.ignoreSync = function(fn) {
	this.inspectSync(function() {
		fn();
	});
};
