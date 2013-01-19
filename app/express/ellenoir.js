/*jshint node: true */
'use strict';

var fs = require('fs'),
    path = require('path');

var express = require('express'),
    consolidate = require('consolidate');

var modules = [];

/**
 * Register all modules at a given path.
 *
 * @param String absolute The modules absolute path.
 */
function registerModulesPath(absolutePath) {
  fs.readdirSync(absolutePath).forEach(function(moduleName) {
    var moduleDefinition = {
      name: moduleName,
      path: path.join(absolutePath, moduleName),
      depends: []
    };

    // If a 'module.json' file is present in the module directory, merge configuration.
    var configurationFile = path.join(moduleDefinition.path, 'module.json');
    if (fs.existsSync(configurationFile)) {
      var moduleConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
      for (var key in moduleConfiguration) {
        if (Object.prototype.hasOwnProperty.call(moduleConfiguration, key)) {
          moduleDefinition[key] = moduleConfiguration[key];
        }
      }
    }

    modules.push(moduleDefinition);
  });
}

/**
 * Resolve the modules inner-dependencies so the array is sorted in the
 * order modules require to be loaded.
 */
function resolveDependencyGraph(modules) {
  var sorted = [], visited = {};

  // Adapted from https://gist.github.com/1732686
  function visit(module, ancestors) {
    if (module.name in visited) {
      return false;
    }
    visited[module.name] = true;

    ancestors = (Array.isArray(ancestors) ? ancestors : []);
    ancestors.push(module.name);

    module.depends.forEach(function(name) {
      var dependency;
      modules.forEach(function(module) {
        if (module.name === name) {
          dependency = module;
          return false;
        }
      });
      if ( ! dependency) {
        throw new Error('Missing dependency "' + name + '" required by "' + module.name + '".');
      }
      if (ancestors.indexOf(name) >= 0) {
        throw new Error('Circular dependency "' + name + '" required by "' + module.name + '": ' + ancestors.join(' -> '));
      }

      visit(dependency, Array.prototype.slice.call(ancestors));
    });

    sorted.push(module);
  }

  modules.forEach(visit);

  return sorted;
}

/**
 * Register modules at the specified relative paths.
 *
 * @param Array paths An array of relative paths.
 */
function registerModules(paths) {
  paths.forEach(function(relativePath) {
    var absolutePath = path.resolve(__dirname + relativePath);
    if ( ! fs.existsSync(absolutePath)) {
      throw new Error('The module path "' + absolutePath + '" does not exist or you do not have permissions to access it.');
    }
    registerModulesPath(absolutePath);
  });
  modules = resolveDependencyGraph(modules);
}

/**
 * Configure each registered module if it contains an 'index.js' file.
 *
 * @param Object options The application options object.
 */
function configureModules(options) {
  modules.forEach(function(module) {
    var indexFile = path.join(module.path, 'index.js');
    if ( ! fs.existsSync(indexFile)) {
      return true;
    }
    var moduleExports = require(indexFile);
    if ('configure' in moduleExports) {
      moduleExports.configure(options);
    }
  });
}

/**
 * Register modules' web/ directory as a static file module in the Express application.
 *
 * @param Express app The Express application.
 * @return Array An array of all registered paths.
 */
function registerStaticFiles(app) {
  var paths = [];
  modules.forEach(function(module) {
    var webPath = path.join(module.path, 'web');
    if ( ! fs.existsSync(webPath)) {
      return true;
    }
    module.webPath = webPath;
    module.webUrl = ('/module/' + module.name + '/');

    app.use(module.webUrl, express['static'](module.webPath));
    paths.push(module.webPath);
  });
  return paths;
}

/**
 * Collect a list of all web files available across modules.
 *
 * @param String extension The file extension extension used to filter matching files.
 * @return Array
 */
function getModulesWebFiles(extension) {
  var files = [];
  modules.forEach(function(module) {
    if ( ! module.webPath) {
      return true;
    }
    fs.readdirSync(module.webPath).forEach(function(file) {
      if (path.extname(file) === extension) {
        files.push(module.webUrl + file);
      }
    });
  });
  return files;
}

function getModulesWebStyles() {
  return getModulesWebFiles('.less');
}

function getModulesWebScripts() {
  return getModulesWebFiles('.js');
}

exports.configure = function(options) {
  var app = options.app;
  app.set('views', path.resolve(__dirname + '/../views/'));
  app.set('view cache', false);
  app.engine('hbs', consolidate.handlebars);

  registerModules(['/../modules/']);
  configureModules(options);

  // Avoid Chrome complaining about resources being transferred with the wrong mime-type.
  // Set up Express so it serves files from the web/ directory.
  express['static'].mime.define({ 'text/css': ['less'] });

  registerStaticFiles(app);

  app.get('/', function(request, response) {
    response.render('index.html.hbs', {
      styles: getModulesWebStyles(),
      scripts: getModulesWebScripts()
    });
  });
};
