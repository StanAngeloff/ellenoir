/*jshint browser: true */
/*global $, console */

// Create a global Ellenoir application that is shared by other modules.
this.ellenoir = {};

(function() {
'use strict';

// The default application options.
this.options = {
  room: 'default'
};

var widgets = {};
/**
 * Get the widget element belonging to a module.
 *
 * @return HTMLElement
 */
this.$widget = function(module) {
  if (module in widgets) {
    return widgets[module];
  }
  widgets[module] = $('#widget-' + module);
  return widgets[module];
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
