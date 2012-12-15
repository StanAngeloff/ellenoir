/*global $ */

(function() {

'use strict';

function WallEntity($element, objectId) {
  this.$element = $element;
  this.objectId = (objectId || 'local');
}

WallEntity.prototype = {
  is: function(objectId) { return (this.$element && this.objectId === objectId); },

  isLocal:   function() { return this.is('local'); },
  isRemote:  function() { return ( ! this.isLocal()); },
  isHidden:  function() { return this.withElement('hasClass', 'hide'); },
  isShowing: function() { return ( ! this.isHidden()); },

  hide: function() { return this.withElement('addClass', 'hide'); },
  show: function() { return this.withElement('removeClass', 'hide'); },

  withElement: function() {
    if (this.$element) {
      var args = Array.prototype.slice.call(arguments), method = args.shift();
      return this.$element[method].apply(this.$element, args);
    }
    return false;
  },

  remove: function() {
    if ( ! this.$element) {
      return false;
    }
    this.$element.remove();
    this.$element = null;
    return true;
  }
};

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
  this._walls.push(new WallEntity($local));
  this._autoSwitch();
};

Wall.prototype.attachRemoteStream = function(objectURL, objectId) {
  var $original = $(this._options.remoteQuery), $clone;
  $clone = $original.clone();
  $clone.find(this._options.cameraQuery).attr('src', objectURL);
  $original.after($clone);
  this._walls.push(new WallEntity($clone, objectId));
  this._autoSwitch();
};

Wall.prototype.detachRemoteStream = function(objectId) {
  for (var i = this._walls.length - 1, wall; i >= 0; i = i - 1) {
    wall = this._walls[i];
    if (wall.is(objectId)) {
      wall.remove();
      this._walls.splice(i, 1);
      this._autoSwitch();
      break;
    }
  }
};

Wall.prototype.find = function(callback, limit) {
  var result = [];
  if (typeof callback === 'string') {
    callback = WallEntity.prototype[callback];
  }
  limit = (arguments.length > 1 ? limit : 9e9);
  for (var i = 0, length = this._walls.length, wall; i < length; i = i + 1) {
    wall = this._walls[i];
    if (callback.call(wall)) {
      result.push(wall);
    }
  }
  return (limit === 1 ? result[0] : result.slice(0, limit));
};

Wall.prototype.show = function(next) {
  if ( ! next) {
    return false;
  }
  var previous = this.find('isShowing', 1);
  if (previous === next) {
    return false;
  }
  if (previous) {
    previous.hide();
  }
  next.show();
};

Wall.prototype._autoSwitch = function() {
  // Show the last remote wall, if any.
  var remotes = this.find('isRemote');
  if (remotes.length) {
    return this.show(remotes[remotes.length - 1]);
  }
  // Show the local wall.
  var local = this.find('isLocal', 1);
  if (local) {
    return this.show(local);
  }
};

this.Wall = Wall;

}).call(this.Ellenoir);
