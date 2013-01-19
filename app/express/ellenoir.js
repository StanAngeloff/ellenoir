/*jshint node: true */
'use strict';

var path = require('path');

var express = require('express'),
    WebRTC = require('webrtc.io');

exports.rtc = null;

exports.configure = function EllenoirConfigure(options) {
  var app = options.app,
      server = options.server;
  // Avoid Chrome complaining about resources being transferred with the wrong mime-type.
  express['static'].mime.define({ 'text/css': ['less'] });
  // Set up Express so it serves files from the web/ directory.
  app.use(express['static'](path.resolve(__dirname + '/../../web/')));
  // Start a WebRTC server with defaults.
  exports.rtc = WebRTC.listen(server);
};
