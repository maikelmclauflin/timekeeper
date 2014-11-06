var fs = require('fs'),
    path = require('path'),
    watch = require('watch'),
    _ = require('underscore'),
    updateDatabase = require('./socket.js');
module.exports = fn = function (o) {
    function FSEvent(obj) {
        this.time = new Date().valueOf();
        this.fileName = obj.fileName;
        this.event = obj.event;
        this.status = {};
        this.status.current = obj.currentStatus;
        if (obj.previousStatus) this.status.previous = obj.previousStatus;
        return this;
    }

    function logFileIgnore(logFileNameMain) {
        return function makeRegex(regex) {
            var regexp = new RegExp(logFileNameMain + '|' + regex, 'g');
            return regexp;
        };
    }
    // o.ignoreDirectoryPattern = makeRegex(o.ignoreDirectoryRegex);
    return {
        grabJSONcache: function () {
            return fs.readFileSync(o.logFileName, o.charset);
        },
        pushToLogCache: function (obj) {
            var queueItem = new FSEvent(obj);
            this.pushToCache(queueItem);
        },
        pushToCache: function (item) {
            cache.events.push(item);
        },
        logFileIgnore: logFileIgnore,
        makeRegex: logFileIgnore(o.ignoreDirectoryPattern),
        makeNewCache: function () {
            return {
                events: []
            };
        },
        makeNewLogFile: function () {
            fs.openSync(o.logFileName, 'w');
        },
        resetLogFile: function () {
            fs.writeFileSync(o.logFileName, JSON.stringify(this.makeNewCache()), o.charset);
        },
        updateLogWithCache: function () {
            var exists = fs.existsSync(o.logFileName, o.charset),
                contents, contentsObj;
            if (!exists) this.makeNewLogFile();
            contents = fs.readFileSync(o.logFileName, o.charset);
            if (contents === '' || contents == '\n') {
                this.resetLogFile();
                contents = fs.readFileSync(o.logFileName, o.charset);
            }
            contentsObj = JSON.parse(contents);
            contentsObj.events = contentsObj.events.concat(cache.events);
            fs.writeFileSync(o.logFileName, JSON.stringify(contentsObj), o.charset);
            console.log(cache);
            cache = this.makeNewCache();
        }
    };
};