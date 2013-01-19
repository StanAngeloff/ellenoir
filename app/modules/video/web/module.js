/*global _, $, PeerConnection, rtc */
/*jshint browser: true */

// Make sure the browser used has PeerConnection capabilities.
// WebRTC.io should have taken care of property browser vendoring.
if (typeof PeerConnection === 'undefined') {
  window.alert('Whoops! You are using software which does not support the features required for this application to run.\n\nPlease download and install a copy of Google Chrome to continue.');
}

// The RTC modules attempts to establish a connection to the WebRTC server.
(function(ellenoir) {
'use strict';

function updateLocalStreams(context) {
  ellenoir.$widget('video').find('.local').attr('src', context);
}

var $default, attachedIds = [];

function attachRemoteStream(context, id) {
  // Check if a stream with the same ID is already attached.
  if (_.contains(attachedIds, id)) {
    return false;
  }
  // If this is the first time a remote stream is added, find the default video element.
  if ( ! $default) {
    $default = ellenoir.$widget('video').find('.default');
  }
  var $clone = $default.clone().removeClass('default').attr({ id: id });
  $clone.attr('src', context);
  // Inject the cloned element after the default element and collapse the latter.
  $default.after($clone.removeClass('collapsed')).addClass('collapsed');
  // Register the stream ID.
  attachedIds.push(id);
}

function detachRemoteStream(id) {
  // Check if we have registered the stream ID.
  if ( ! _.contains(attachedIds, id)) {
    return false;
  }
  // Delete the element from the DOM.
  $('#' + id).remove();
  // Unregister the stream ID.
  attachedIds = _.without(attachedIds, id);
  // If there are no streams left, restore the default element.
  if (attachedIds.length < 1 && $default) {
    $default.removeClass('collapsed');
  }
}

/**
 * Request access to the local video/audio streams.
 *
 * @param Object options The streams to acquire where { key } is the stream name.
 */
function openLocalStreams(options) {
  var acquire = {
    audio: ('audio' in options ? options.audio : true),
    video: ('video' in options ? options.video : true)
  };
  ellenoir.debug('Acquiring streams [ %s ]...', _.keys(_.pick(acquire, function(v) { return v; })).join(', '));

  rtc.createStream(acquire, function(stream) {
    ellenoir.debug('Local media streams acquired successfully.');
    updateLocalStreams(window.URL.createObjectURL(stream));
  }, function() {
    ellenoir.debug('Failed to acquire local media streams.');
    window.alert('Whoops! The application failed to acquire your audio/video. Please restart the application, grant access and try again.');
  });
}

var socketsNamespace = 'remoteStreamS-';

// Listen for remote stream changes.
rtc.on('add remote stream', function(stream, socketId) {
  ellenoir.debug('Remote stream "%s" added to room.', socketId);
  attachRemoteStream(window.URL.createObjectURL(stream), socketsNamespace + socketId);
});

rtc.on('disconnect stream', function(socketId) {
  ellenoir.debug('Remote stream "%s" left the room.', socketId);
  detachRemoteStream(socketsNamespace + socketId);
});

openLocalStreams(ellenoir.options);

})(this.ellenoir);
