const fs = require("fs");
const path = require("path");
const checker = require('license-checker');

let licenseFolder = "./3rdparty_licenses";

if (!fs.existsSync(licenseFolder)) {
    fs.mkdirSync(licenseFolder);
}

checker.init({
    start: './',
    deps: 'true'
}, function (err, packages) {
    if (err) {
    } else {
        console.log(packages);
        let theParsed = packages;

        for (let obj in theParsed) {
            if (fs.existsSync(theParsed[obj].licenseFile)) {
                console.log(theParsed[obj].licenseFile);
                let tgt = licenseFolder + path.sep + path.dirname(theParsed[obj].licenseFile).split(path.sep).pop() + ".txt";
                fs.copyFileSync(theParsed[obj].licenseFile, tgt);
            }
        }
    }
});