// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var stdout = exports.stdout = {};

stdout.inspect = function() {
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


// This code inspired by http://userinexperience.com/?p=714
//exports.override = function override(newStdout) {
//	var original = process.stdout.write;
//	process.stdout.write = newStdout;
//	return function() {
//		process.stdout.write = original;
//	};
//};
//
//exports.ignore = function ignore() {
//	return exports.override(function() {});
//};

exports.inspect = function inspect(callback) {
	var output = [];
	var restoreStdout = exports.override(function(string) {
		output.push(string);
	});
	callback(output);
	restoreStdout();
};
