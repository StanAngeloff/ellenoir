var WebRTC = require('webrtc.io');

function Ellenoir(app, options) {
  'use strict';
  // Check if the constructor was called without 'new'.
  if ( ! (this instanceof Ellenoir)) {
    return new Ellenoir(app, options);
  }
  options = (options || {});
  this._rtc = WebRTC.listen(options.server || options.port || app);
  this.install(app, options);
}

Ellenoir.prototype.install = function(app, options) {
  'use strict';
  // Serve 'webrtc.io.js' from the 'webrtc.io-client' package.
  app.get((options.directory || '/') + 'webrtc.io.js', function(request, response) {
    response.sendfile('webrtc.io.js', {
      maxAge: options.maxAge,
      root: (options.root || __dirname + '/scripts/')
    });
  });
};

Ellenoir.prototype.on = function() {
  'use strict';
  // Delegate to the WebRTC instance.
  this._rtc.rtc.on.apply(this._rtc.rtc, arguments);
  // Allow method chaining.
  return this;
};

module.exports = Ellenoir;
