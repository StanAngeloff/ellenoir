/*jshint node: true */
'use strict';

var WebRTC = require('webrtc.io');

exports.rtc = null;

exports.configure = function(options) {
  // Start a WebRTC server with defaults.
  exports.rtc = WebRTC.listen(options.server);
};
