/*global rtc */
/*jshint browser: true */

// Make sure the WebRTC.io library was included.
if (typeof rtc === 'undefined') {
  window.alert('Whoops! The application cannot start due to missing features.\n\nPlease contact support for assistance.');
}

// The RTC modules attempts to establish a connection to the WebRTC server.
(function(ellenoir) {
'use strict';

// Default the server connection string from window location if an explicit
// connection wasn't specified in the application.
var server =
      (ellenoir.options.protocol || (window.location.protocol.replace(/^http/, 'ws'))) + '://' +
      (ellenoir.options.server || window.location.hostname) + ':' +
      (ellenoir.options.port || window.location.port || 80) + '/',
    room = (ellenoir.options.room || 'default');

ellenoir.debug('Connecting to "%s" in room "%s"...', server, room);
rtc.connect(server, room);

})(this.ellenoir);
