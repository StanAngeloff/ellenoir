/*global $, PeerConnection, rtc */
/*jshint browser: true */

// Make sure the WebRTC.io library was included.
if (typeof rtc === 'undefined') {
  window.alert('Whoops! The application cannot start due to missing features.\n\nPlease contact support for assistance.');
// Make sure the browser used has PeerConnection capabilities.
// WebRTC.io should have taken care of property browser vendoring.
} else if (typeof PeerConnection === 'undefined') {
  window.alert('Whoops! You are using software which does not support the features required for this application to run.\n\nPlease download and install a copy of Google Chrome to continue.');
} else {

(function() {

'use strict';

function Ellenoir(options) {
  // Check if the constructor was called without 'new'.
  if ( ! (this instanceof Ellenoir)) {
    return new Ellenoir(options);
  }
  options = (options || {});
  this.requestLocalStreams(options);
  this.connect(options);
}

Ellenoir.prototype.requestLocalStreams = function(options) {
  var acquire = {
    audio: ('audio' in options ? options.audio : true),
    video: ('video' in options ? options.video : true)
  };
  console.debug('Acquiring streams %s...', JSON.stringify(acquire));
  rtc.createStream(acquire, function(stream) {
    console.info('Local media streams acquired successfully.');
    $(options.localCameraElement || 'video').attr('src', window.URL.createObjectURL(stream));
  }, function() {
    console.error('Failed to acquire local media streams.');
    window.alert('Whoops! The application failed to acquire audio/video. Please restart the application, grant access and try again.');
  });
};

Ellenoir.prototype.connect = function(options) {
  var idNamespace = 'remote-stream-socket-';
  console.debug('Connecting to "%s" in room "%s"...', ('ws://' + (options.server || window.location.hostname) + ':' + (options.port || window.location.port || 80) + '/'), options.room);
  rtc.connect('ws://' + (options.server || window.location.hostname) + ':' + (options.port || window.location.port || 80) + '/', options.room);
  rtc.on('add remote stream', function(stream, socketId) {
    console.debug('Remote stream "%s" added to room.', socketId);
    var $original, $video, $clone;
    if (options.cloneElement) {
      $original = $(options.cloneElement);
      $clone = $original.clone();
      $video = $clone.find(options.remoteCameraElement || options.localCameraElement || 'video');
    } else {
      $original = $video = $(options.remoteCameraElement || options.localCameraElement || 'video');
      $clone = $original.clone();
    }
    $clone.attr('id', (idNamespace + socketId));
    $original.after($clone);
    $clone.removeClass('collapsed');
    $video.attr('src', window.URL.createObjectURL(stream));
  });
  rtc.on('disconnect stream', function(socketId) {
    console.debug('Remote stream "%s" left the room.', socketId);
    $('#' + idNamespace + socketId).remove();
  });
};

if (typeof module === 'undefined') {
  this.Ellenoir = Ellenoir;
} else {
  module.exports = Ellenoir;
}

}).call(this);

}
