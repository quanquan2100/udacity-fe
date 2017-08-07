(function() {
  // 常量
  var MAP_APP_KEY = "AIzaSyAjkLBg_PHjw5O4h8S9tAc_iSojq4BKA9s";


  var app = {};
  app.init = function() {
    return new Promise(function(resolve, reject) {
      // config require
      requirejs.config({
        baseUrl: "/bower_components",
        paths: {
          jquery: "jquery/dist/jquery.min",
          bootstrap: "bootstrap/dist/js/bootstrap.min",
          knockout: "knockout/dist/knockout",
          underscore: "underscore/underscore",
          tether: "tether/dist/js/tether", // 由于 bootstrap 使用其全局变量, 导致不适用于 require.
          googlemap: "https://maps.googleapis.com/maps/api/js?libraries=places,geometry,drawing&key=" + MAP_APP_KEY + "&v=3&callback=define"
        },
        shim: {
          bootstrap: {
            deps: ['tether', 'jquery']
          }
        }
      });

      requirejs(["jquery", "underscore", "knockout", "tether", "bootstrap"], function() {
        app.spinner = $(".loader");
        app.map = $("#map");
        app.dialog = {
          "error": $(".dialog-container #error")
        };

        resolve();
      }, function(err) {
        console.error("err:", err);
        reject(Error("It broke", err));
      });
    });
  };

  app.initMap = function() {
    var getCurrentPos = function() {
      return new Promise(function(resolve, reject) {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            resolve(pos);
          }, function() {
            reject("Get Geolocation fail");
          });
        } else {
          // Browser doesn't support Geolocation
          reject("Browser doesn't support Geolocation");
        }
      });
    };

    var getLocations = function(pos) {
      return new Promise(function(resolve, reject) {
        resolve({
          "pos": pos,
          "locations": [
            { title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 } },
            { title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
            { title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
            { title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 } },
            { title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
            { title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } }
          ]
        });
      });
    };

    var drawMap = function(data) {
      return new Promise(function(resolve, reject) {
        requirejs(["googlemap"], function() {
          var map;

          // Create a new blank array for all the listing markers.
          var markers = [];

          // This global polygon variable is to ensure only ONE polygon is rendered.
          var polygon = null;

          // Create placemarkers array to use in multiple functions to have control
          // over the number of places that show.
          var placeMarkers = [];

          function initMap() {

            // Constructor creates a new map - only center and zoom are required.
            map = new google.maps.Map(document.getElementById('map'), {
              center: data.pos,
              zoom: 13,
              // styles: styles,
              mapTypeControl: false
            });

            // These are the real estate listings that will be shown to the user.
            // Normally we'd have these in a database instead.
            var locations = data.locations;

          }

          initMap();
          console.log("Stuff worked1!");
          resolve("Stuff worked1!");
        }, function(err) {
          console.log("It broke1");
          reject(Error("It broke1"));
        });
      });
    };

    return getCurrentPos().then(getLocations).then(drawMap);
  };

  app.startLoad = function() {
    return new Promise(function(resolve, reject) {
      if (app.spinner) {
        app.spinner.removeAttr("hidden");
      }
      resolve();
    });
  };

  app.endLoad = function() {
    return new Promise(function(resolve, reject) {
      app.spinner.attr("hidden", "");
      resolve();
    });
  };

  app.startLoad()
  .then(app.init)
  .then(app.initMap)
  .then(app.endLoad)
  .then(function(result) {
    console.log(result);
  }, function(err) {
    console.log(err);
  });
  window.app = app;
}());