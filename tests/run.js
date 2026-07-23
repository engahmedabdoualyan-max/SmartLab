#!/usr/bin/env node
// ====================================================================
// SmartLAP Unit Test Runner
// Run: node tests/run.js
// ====================================================================

var fs = require('fs');
var path = require('path');

// Load test framework
eval(fs.readFileSync(path.join(__dirname, 'framework.js'), 'utf8'));

// Load the test file (defines functions + _tests array)
var testFile = path.join(__dirname, 'calculations.test.js');
eval(fs.readFileSync(testFile, 'utf8'));

var passed = 0;
var failed = 0;
var errors = [];

console.log('');
console.log('  SmartLAP — Unit Test Suite');
console.log('  ==========================');
console.log('');

_tests.forEach(function (t, idx) {
    var label = t.suite + ' › ' + t.name;
    try {
        t.fn();
        passed++;
        console.log('  ✓ ' + label);
    } catch (e) {
        failed++;
        errors.push({ test: label, error: e });
        console.log('  ✗ ' + label);
        console.log('    ' + e.message);
    }
});

console.log('');
console.log('  ==========================');
console.log('  ' + passed + ' passing, ' + failed + ' failing');
console.log('');

if (failed > 0) {
    console.log('  Failures:');
    errors.forEach(function (e, i) {
        console.log('  ' + (i + 1) + ') ' + e.test);
        console.log('     ' + e.error.message);
    });
    console.log('');
    process.exit(1);
} else {
    console.log('  All tests passed!');
    console.log('');
    process.exit(0);
}
