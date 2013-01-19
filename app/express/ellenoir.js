/*jshint node: true*/
'use strict';

exports.configure = function EllenoirConfigure(options) {
  options.app.get('/', function(request, response) {
    response.end('Hello World!');
  });
};
