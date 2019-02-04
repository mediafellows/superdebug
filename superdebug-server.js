'use strict'

var chalk = require('chalk')
var _debug = require('debug')

function formatToCurl (request, requestUrl) {
  var headers = Object.keys(request.header).reduce(function (headers, key) {
    return headers + ('-H \'' + key + ': ' + request.header[key] + '\' ')
  }, '')
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
  var query = ''
  if (request.qs) {
    query = requestUrl.includes('?') ? '&' : '?'
    query += Object.keys(request.qs).map(key => `${key}=${request.qs[key]}`).join('&')
  }
  return 'curl -v -X ' + request.method + ' ' + headers + formData + data + constructUrl(requestUrl, query)
};

function constructUrl (requestUrl, query) {
  var urlparts = requestUrl.split('#')
  var url = urlparts[0] + query
  url += urlparts[1] ? '#' + urlparts[1] : ''
  return url
}

function getColorByResponseStatus (status) {
  if (status === 'NO_STATUS_CODE') {
    return 'red'
  } else if (status < 300) {
    return 'green'
  } else if (status < 400) {
    return 'yellow'
  }
  return 'red'
};

function getColorByResponseTime (ms) {
  if (ms < 200) {
    return 'green'
  } else if (ms < 1000) {
    return 'magenta'
  } else if (ms < 5000) {
    return 'yellow'
  }
  return 'red'
};

function handleResponse (request, start, logger, debugLog, debugCurl, isError) {
  return function (responseOrError) {
    var now = new Date().getTime()
    var elapsed = now - start
    var elapseTime = elapsed + 'ms'
    var protocol = request.protocol.toUpperCase().replace(/[^\w]/g, '')
    var requestMethod = request.method.toUpperCase()
    var curl = formatToCurl(request, request.url)
    var status = isError ? 'NO_STATUS_CODE' : responseOrError.status

    debugCurl(chalk.gray(curl))
    logger(curl)
    if (isError) logger(chalk.red(responseOrError))
    debugLog(
      '%s %s %s %s %s',
      chalk.magenta(protocol),
      chalk.cyan(requestMethod),
      chalk[getColorByResponseStatus(status)](status),
      chalk.gray(request.url),
      chalk.gray('(') + chalk[getColorByResponseTime(elapsed)](elapseTime) + chalk.gray(')')
    )
    logger(protocol + ' ' + requestMethod + ' ' + status + ' ' + request.url + ' (' + elapseTime + ')')
  }
};

module.exports = function superdebug (logger, options = { logName: 'super-debug', curlName: 'super-curl' }) {
  logger = logger || function () { }
  options = options || { logName: 'super-debug', curlName: 'super-curl' }

  return function (request) {
    var debugLog = _debug(options.logName)
    var debugCurl = _debug(options.curlName)
    var start = new Date().getTime()
    request.on('response', handleResponse(request, start, logger, debugLog, debugCurl, false))
    request.on('error', handleResponse(request, start, logger, debugLog, debugCurl, true))
  }
}
