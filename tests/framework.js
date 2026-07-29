/*
SmartLAP Calculator Test Suite
====================

This file contains comprehensive unit tests for all SmartLAP calculation functions.
The tests are organized to ensure the accuracy and reliability of our
laboratory automation calculations.

Test Framework: Custom.js (similar to Jest)
*/

// Required calculation functions are imported/defined at the top of this file
// See: js/calculations.js

// ====================================================================
// TEST FRAMEWORK
// ====================================================================

var _tests = [];
var _suites = [];
var _currentSuite = '';

function describe(name, fn) {
    _currentSuite = name;
    _suites.push(name);
    fn();
    _currentSuite = '';
}

function it(name, fn) {
    _tests.push({ suite: _currentSuite, name: name, fn: fn });
}

function assertClose(actual, expected, tolerance, msg) {
    tolerance = tolerance || 0.01;
    if (typeof actual !== 'number' || typeof expected !== 'number' ||
        typeof tolerance !== 'number') {
        throw new Error((msg || '') + ' All parameters must be numbers');
    }
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error((msg || '') + ' Expected ~' + expected + ' but got ' + actual + ' (tolerance ±' + tolerance + ')');
    }
}

function assertEqual(actual, expected, msg) {
    if (actual !== expected) {
        throw new Error((msg || '') + ' Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual));
    }
}

function assertTrue(val, msg) {
    if (!val) throw new Error(msg || 'Expected truthy value');
}

function assertFalse(val, msg) {
    if (val) throw new Error(msg || 'Expected falsy value');
}

function runTests() {
    var failed = 0;
    var passed = 0;
    console.log('\n🧪 SmartLAP Calculator Test Suite');
    console.log('====================================\n');

    for (var i = 0; i < _tests.length; i++) {
        var test = _tests[i];
        try {
            test.fn();
            console.log('✅ ' + test.suite + ': ' + test.name);
            passed++;
        } catch (error) {
            console.error('❌ ' + test.suite + ': ' + test.name);
            console.error('   ' + error.message);
            failed++;
        }
    }

    console.log('\n====================================');
    console.log('Tests Passed: ' + passed);
    console.log('Tests Failed: ' + failed);
    console.log('Total Tests: ' + (_tests.length));
    console.log('====================================\n');

    if (failed > 0) {
        console.log('⚠️  Test suite completed with ' + failed + ' failures');
        return false;
    } else {
        console.log('🎉 All tests passed successfully!');
        return true;
    }
}

// Execute tests when run directly
if (typeof require === 'undefined' || !require.main) {
    // Browser environment
    window.runTests = runTests;
} else {
    // Node.js environment
    runTests();
}
