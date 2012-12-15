/*global $, angular */

(function() {

'use strict';

var exports = this, app;

function Application(options) {
  // Check if the constructor was called without 'new'.
  if ( ! (this instanceof Application)) {
    return new Application(options);
  }
  this._options = $.extend({ room: 'default' }, options);
  this._wall = exports.Wall(this._options);
  this._client = exports.Client($.extend({}, this._options, this._wall));
  // Set the top-level application instance to the current object.
  app = this;
}

this.Application = Application;

angular.module('Ellenoir', []).factory('$app', function() {
  return app;
});

}).call(this.Ellenoir = {});
