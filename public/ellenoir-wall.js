/*global $ */

(function() {

'use strict';

function Wall(options) {
  // Check if the constructor was called without 'new'.
  if ( ! (this instanceof Wall)) {
    return new Wall(options);
  }
  this._walls = [];
  this._options = (options || {});
}

Wall.prototype.attachLocalStream = function(objectURL) {
  var $local = $(this._options.localQuery),
      $camera = $local.find(this._options.cameraQuery);
  $camera.attr('src', objectURL);
  this._walls.push($local);
};

Wall.prototype.attachRemoteStream = function(objectURL, objectId) {
  var $original = $(this._options.remoteQuery), $clone;
  $clone = $original.clone().attr('id', objectId).removeClass(this._options.collapsedClass || 'collapsed');
  $original.after($clone);
  $clone.find(this._options.cameraQuery).attr('src', objectURL);
  this._walls.push($clone);
};

Wall.prototype.detachRemoteStream = function(objectId) {
  for (var i = this._walls.length - 1, $wall; i >= 0; i = i - 1) {
    $wall = this._walls[i];
    if ($wall.attr('id') === objectId) {
      $wall.remove();
      this._walls.splice(i, 1);
      break;
    }
  }
};

this.Wall = Wall;

}).call(this.Ellenoir = (this.Ellenoir || {}));
