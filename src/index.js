// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var stdout = exports.stdout = {};

stdout.inspect = function() {
	// This code inspired by http://userinexperience.com/?p=714
	var output = [];

	var originalStdout = process.stdout.write;
	process.stdout.write = function(string) {
		output.push(string);
	};

	return {
		output: output,
		restore: function() {
			process.stdout.write = originalStdout;
		}
	};
};

stdout.inspectSync = function(fn) {
	var inspect = stdout.inspect();
	fn(inspect.output);
	inspect.restore();
	return inspect.output;
};

stdout.ignore = function(fn) {
	return stdout.inspect().restore;
};

stdout.ignoreSync = function(fn) {
	stdout.inspectSync(function() {
		fn();
	});
};