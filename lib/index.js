const http2Client = require('http2-client/https');
const followRedirects = require('follow-redirects');
var h2Follow = require('follow-redirects').wrap({
  https : http2Client
});

followRedirects.http2 = h2Follow.https;

module.exports = followRedirects;