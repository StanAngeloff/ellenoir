/*jshint browser: true */
/*global console */

// Create a global Ellenoir application that is shared by modules.
this.ellenoir = {};

(function() {
'use strict';

// The default application options.
this.options = {
  room: 'default'
};

/**
 * Format and print a debug message to the console.
 *
 * @see console.debug
 */
this.debug = function() {
  return console.debug.apply(console, arguments);
};

}).call(this.ellenoir = {});
