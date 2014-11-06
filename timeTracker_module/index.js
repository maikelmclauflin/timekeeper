var fs = require('fs'),
    path = require('path'),
    watch = require('watch'),
    _ = require('underscore'),
    updateDatabase = require('./socket.js'),
    fn = require('./functions.js');

function MakeOptions(o) {
    if (o.dirName === undefined) o.dirName = __dirname + '../';
    if (o.ignoreUnreadableDir === undefined) o.ignoreUnreadableDir = true;
    if (o.ignoreDotFiles === undefined) o.ignoreDotFiles = true;
    if (o.saveCacheInterval === undefined) o.saveCacheInterval = 2000;
    if (o.uploadInterval === undefined) o.uploadInterval = 6000;
    if (o.charset === undefined) o.charset = 'UTF-8';
    if (o.logFileNameMain === undefined) o.logFileNameMain = '.log';
    if (o.logFileNameSuffix === undefined) o.logFileNameSuffix = '.json';
    if (o.logFileName === undefined) o.logFileName = __dirname + '/' + o.logFileNameMain + o.logFileNameSuffix;
    if (o.ignoreDirectoryRegex === undefined) o.ignoreDirectoryRegex = 'node_modules';
    if (o.logExists === undefined) o.logExists = fs.existsSync(o.logFileName);
    return o;
}
module.exports = function (opts) {
    opts = new MakeOptions(opts);
    // starts as a function
    fn = fn(opts);
    // now it's an object with a bunch of methods on it.
    opts.makeRegex = fn.logFileIgnore(opts.logFileNameMain);
    cache = fn.makeNewCache();
    if (!opts.logExists) fn.makeNewLogFile();
    setInterval(_.bind(fn.updateLogWithCache, fn), opts.saveCacheInterval);
    setInterval(_.bind(updateDatabase().addToDB), opts.uploadInterval);
    watch.createMonitor(opts.dirName, opts, function (monitor) {
        monitor.on("created", function (f, stat) {
            if (f === opts.logFileName) return;
            fn.pushToLogCache({
                event: 'created',
                fileName: f,
                currentStatus: stat
            });
        });
        monitor.on("changed", function (f, curr, prev) {
            if (f === opts.logFileName) return;
            fn.pushToLogCache({
                event: 'changed',
                fileName: f,
                currentStatus: curr,
                previousStatus: prev
            });
        });
        monitor.on("removed", function (f, stat) {
            if (f === opts.logFileName) return;
            fn.pushToLogCache({
                event: 'removed',
                fileName: f,
                currentStatus: stat
            });
        });
    });
    return fn;
};