const http2Client = require('http2-client');
const followRedirects = require('follow-redirects');
var h2Follow = require('follow-redirects').wrap({
  https : http2Client
});

module.exports = {
  http2 : h2Follow.https,
  http  : followRedirects.http,
  https : followRedirects.https
};