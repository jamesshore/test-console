// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var stdout = exports.stdout = {};

stdout.inspectSync = function(fn) {
	var output = [];
	var originalStdout = process.stdout.write;
	process.stdout.write = function(string) {
		output.push(string);
	};

	fn(output);
	process.stdout.write = originalStdout;

	return output;
};

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
