'use strict';

var _debug = require('debug');

// IE :-(
if (!Object.keys) {
  Object.keys = function (obj) {
    var keys = [];
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) keys.push(i);
    }
    return keys;
  };
}

function formatToCurl(request, requestUrl) {
  var headers = Object.keys(request.header).reduce(function (headers, key) {
    return headers + ('-H \'' + key + ': ' + request.header[key] + '\' ');
  }, '');
  var data = ''
  if (request._data) {
    try {
      data = `-d '${JSON.stringify(request._data)}' `
    } catch (error) {
      data = `-d '${request._data}' `
    }
  }
  var formData = ''
  if (request._formData) {
    formData = '-F ' + Object.keys(request._formData).map(key => `'${key}=${request._formData[key]}' `).join('-F ')
  }
  return 'curl -v -X ' + request.method + ' ' + headers + data + requestUrl;
};

function handleResponse(request, start, logger, debugLog, debugCurl) {
  return function (response) {
    var now = new Date().getTime();
    var elapsed = now - start;
    var elapseTime = elapsed + 'ms';
    var protocol = request.protocol.toUpperCase().replace(/[^\w]/g, '');
    var requestMethod = request.method.toUpperCase();
    var curl = formatToCurl(request, request.url);

    debugCurl.apply(null, [curl]);
    logger(curl);
    debugLog.apply(null, ['%s %s %s %s %s', protocol, requestMethod, response.status, request.url, '(' + elapseTime + ')']);
    logger(protocol + ' ' + requestMethod + ' ' + response.status + ' ' + request.url + ' (' + elapseTime + ')');
  };
};

module.exports = function superdebug(logger, options = { logName: 'super-debug', curlName: 'super-curl' }) {
  logger = logger || function () { }
  options = options || { logName: 'super-debug', curlName: 'super-curl' }

  return function (request) {
    var debugLog = _debug(options.logName);
    var debugCurl = _debug(options.curlName);
    var start = new Date().getTime();
    request.on('response', handleResponse(request, start, logger, debugLog, debugCurl));
  };
};