#!/usr/bin/env node

/* smartLAB — Test Page Zone System Updater
   Updates all test pages to include the zone system */

var fs = require('fs');
var path = require('path');

var ROOT = '/home/dr-ahmed/Documents/newprojectsl';

var TEST_FILES = [
    // Concrete tests
    'concrete/tests/test-compressive.html',
    'concrete/tests/test-slump.html',
    'concrete/tests/test-density.html',
    'concrete/tests/test-airspeed.html',
    'concrete/tests/test-temp.html',
    'concrete/tests/test-cylinder.html',
    'concrete/tests/test-rebound.html',
    'concrete/tests/test-upt.html',
    // Asphalt tests
    'asphalt/tests/test-marshall.html',
    'asphalt/tests/test-density.html',
    'asphalt/tests/test-flow.html',
    'asphalt/tests/test-extraction.html',
    'asphalt/tests/test-ignition.html',
    'asphalt/tests/test-gradation.html',
    // Soil tests
    'soil/tests/test-proctor.html',
    'soil/tests/test-plasticity.html',
    'soil/tests/test-density.html',
    'soil/tests/test-cbr.html',
    'soil/tests/test-limits.html',
    'soil/tests/test-specific.html',
    'soil/tests/test-moisture.html',
    'soil/tests/test-grain.html'
];

var updated = 0;
var skipped = 0;
var errors = 0;

TEST_FILES.forEach(function(relPath) {
    var filePath = path.join(ROOT, relPath);

    try {
        if (!fs.existsSync(filePath)) {
            console.log('SKIP (not found): ' + relPath);
            skipped++;
            return;
        }

        var content = fs.readFileSync(filePath, 'utf8');
        var changed = false;

        // Fix 1: Replace broken DOMContentLoaded pattern with direct init
        var brokenPattern = "document.addEventListener('DOMContentLoaded', function() {\n            TestZones.init(";
        if (content.indexOf(brokenPattern) !== -1) {
            var testId = path.basename(relPath, '.html');
            content = content.replace(
                /<script>\s*document\.addEventListener\('DOMContentLoaded', function\(\) \{\s*TestZones\.init\('[^']+'\);\s*\}\);/,
                '<script>\n        if (document.readyState === \'loading\') {\n            document.addEventListener(\'DOMContentLoaded\', function() { TestZones.init(\'' + testId + '\'); });\n        } else {\n            TestZones.init(\'' + testId + '\');\n        }'
            );
            changed = true;
        }

        // Fix 2: If no test-zone.js at all, add everything
        if (content.indexOf('test-zone.js') === -1) {
            var prefix = relPath.indexOf('concrete/') === 0 ? '../../' : '../';
            var testId = path.basename(relPath, '.html');

            // Add CSS
            content = content.replace(
                /<link rel="stylesheet" href="test-common.css">/,
                '<link rel="stylesheet" href="test-common.css">\n    <link rel="stylesheet" href="' + prefix + 'test-zones.css">'
            );

            // Add JS
            content = content.replace(
                /<script src="[^"]*components\.js"><\/script>/,
                '<script src="' + prefix + 'components.js"></script>\n    <script src="' + prefix + 'test-zone.js"></script>\n    <script>\n        if (document.readyState === \'loading\') {\n            document.addEventListener(\'DOMContentLoaded\', function() { TestZones.init(\'' + testId + '\'); });\n        } else {\n            TestZones.init(\'' + testId + '\');\n        }\n    </script>'
            );
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('FIXED: ' + relPath);
            updated++;
        } else {
            console.log('OK (no changes needed): ' + relPath);
            skipped++;
        }

    } catch (e) {
        console.error('ERROR: ' + relPath + ' - ' + e.message);
        errors++;
    }
});

console.log('\n=== Summary ===');
console.log('Fixed: ' + updated);
console.log('Skipped: ' + skipped);
console.log('Errors: ' + errors);
