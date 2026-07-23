var fs = require('fs');
var path = require('path');

var langsDir = path.join(__dirname, '..', 'js', 'lang');
var langOrder = ['en', 'ar', 'zh', 'de', 'fr', 'ja', 'ru'];
var allData = {};
var exitCode = 0;

langOrder.forEach(function(l) {
    var filePath = path.join(langsDir, l + '.json');
    if (!fs.existsSync(filePath)) {
        console.error('ERROR: Missing file: ' + filePath);
        exitCode = 1;
        return;
    }
    allData[l] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
});

var refKeys = Object.keys(allData.en).sort();
var refCount = refKeys.length;

console.log('I18N Validation Report');
console.log('=====================');
console.log('Reference (EN): ' + refCount + ' keys\n');

langOrder.forEach(function(l) {
    var keys = Object.keys(allData[l]).sort();
    var missing = refKeys.filter(function(k) { return keys.indexOf(k) === -1; });
    var extra = keys.filter(function(k) { return refKeys.indexOf(k) === -1; });
    var status = 'OK';
    if (missing.length > 0 || extra.length > 0) {
        status = 'ISSUES';
        exitCode = 1;
    }
    console.log(l + ': ' + keys.length + '/' + refCount + ' keys [' + status + ']');
    if (missing.length > 0) {
        console.log('  MISSING (' + missing.length + '): ' + missing.join(', '));
    }
    if (extra.length > 0) {
        console.log('  EXTRA (' + extra.length + '): ' + extra.join(', '));
    }
});

console.log('\n' + (exitCode === 0 ? 'ALL LANGUAGES VALID' : 'ISSUES FOUND — run node scripts/build-i18n.js to auto-fill'));
process.exit(exitCode);
