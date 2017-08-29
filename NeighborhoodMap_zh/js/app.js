(function() {
  // 常量
  var MAP_APP_KEY = "AIzaSyAjkLBg_PHjw5O4h8S9tAc_iSojq4BKA9s";

  var $map, $modalDelComfirm, $modalSetting, $modalRecordPos, $modalSearch, $spinner, $serachType, $viewMap, $viewHome, $viewList;
  var app = {};


  // ---- viewModel begin --------------------------------------------------------
  var viewModel = {};
  viewModel.init = function(ko) {
    return new Promise(function (resolve, reject) {
      var visitedList = localStorage.getItem("visitedList");
      if (!visitedList) {
        visitedList = [];
        localStorage.setItem("visitedList", "[]");
      } else {
        visitedList = JSON.parse(visitedList);
      }
      var wishList =  localStorage.getItem("wishList");
      if (!wishList) {
        wishList = [];
        localStorage.setItem("wishList", "[]");
      } else {
        wishList = JSON.parse(wishList);
      }
      var centerPlace = localStorage.getItem("centerPlace");
      if (!centerPlace) {
        centerPlace = { "lat": 39.9653473, "lng": 116.27073879999999 };
        localStorage.setItem("centerPlace", '{ "lat": 39.9653473, "lng": 116.27073879999999 }');
      } else {
        centerPlace = JSON.parse(centerPlace);
      }
      var searchList = [];

      var vm = {
        view: ko.observable("main"),
        centerLocation: {
          lat: ko.observable(centerPlace.lat),
          lng: ko.observable(centerPlace.lng)
        },
        wishList: ko.observableArray(wishList),
        visitedList: ko.observableArray(visitedList),
        searchList: ko.observableArray(searchList)
      };
      viewModel.vm = vm;
      resolve(vm);
    });
  };
  viewModel.getVisitedData = function() {
    return viewModel.vm.visitedList();
    var locations = [
      { title: '公司', location: { lat: 39.9653473, lng: 116.27073879999999 } },
      { title: 'www', location: { lat: 39.9553473, lng: 116.29073879999999 } },
      { title: 'ddd', location: { lat: 39.9253473, lng: 116.37073879999999 } },
      { title: 'xxx', location: { lat: 39.9180628, lng: 116.3961237 } }
    ];
    return locations;
  };
  viewModel.setCenterPlace = function (centerPlace) {
    viewModel.centerLocation.lat(centerPlace.lat);
    viewModel.centerLocation.lng(centerPlace.lng);
    localStorage.setItem("centerPlace", JSON.stringify(centerPlace));
  }
  viewModel.addWishPlace = function(data){
    console.log(data);
  };
  // ---- viewModel end --------------------------------------------------------
  // ---- main view begin --------------------------------------------------------

  var mainView = {};

  app.mainView = mainView;
  // ---- main view end --------------------------------------------------------
  // ---- list view begin --------------------------------------------------------

  var listView = {};

  app.listView = listView; 

  // ---- list view end --------------------------------------------------------
  // ---- map view begin --------------------------------------------------------

  var mapView = {};

  mapView.markers = [];
  mapView.visitedMarkers = [];

  mapView.getCenterPosition = function() {
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
          reject(false);
        });
      } else {
        // Browser doesn't support Geolocation
        reject(false);
      }
    });
  };

  mapView.showMap = function(currentPosition) {
    if (mapView.map) {
      mapView.map.setCenter(currentPosition);
      mapView.map.setZoom(15);
      mapView.centerMarker.setPosition(currentPosition);
      mapView.centerMarker.setMap(mapView.map);

    } else {
      return new Promise(function(resolve, reject) {
        requirejs(["googlemap"], function() {
          var styles = [{ featureType: 'water', stylers: [{ color: '#19a0d8' }] }, { featureType: 'administrative', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 6 }] }, { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#e85113' }] }, { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#efe9e4' }, { lightness: -40 }] }, { featureType: 'transit.station', stylers: [{ weight: 9 }, { hue: '#e85113' }] }, { featureType: 'road.highway', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }, { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ lightness: 100 }] }, { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ lightness: -100 }] }, { featureType: 'poi', elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: '#f0e4d3' }] }, { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#efe9e4' }, { lightness: -25 }] }];
          mapView.map = new google.maps.Map(document.getElementById('map'), {
            center: currentPosition,
            zoom: 15,
            styles: styles,
            mapTypeControl: false
          });

          // This autocomplete is for use in the search within time entry box.
          mapView.centerAutocomplete = new google.maps.places.Autocomplete(document.getElementById('set-center'), {
            componentRestrictions: { country: 'cn' }
          });
          mapView.centerAutocomplete.addListener('place_changed', function() {
            mapView.largeInfowindow.close();
            var place = this.getPlace();
            if (!place.geometry) {
              // User entered the name of a Place that was not suggested and
              // pressed the Enter key, or the Place Details request failed.
              window.alert("需要选择列表中的具体地点哦");
              return;
            }
            mapView.map.setCenter(place.geometry.location);
            mapView.map.setZoom(17);
          });

          mapView.largeInfowindow = new google.maps.InfoWindow();
          mapView.largeInfowindow.addListener('closeclick', function() {
            this.marker = null;
          });

          // This function takes in a COLOR, and then creates a new marker
          // icon of that color. The icon will be 21 px wide by 34 high, have an origin
          // of 0, 0 and be anchored at 10, 34).
          function makeMarkerIcon(markerColor) {
            var markerImage = new google.maps.MarkerImage(
              'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
              '|40|_|%E2%80%A2',
              new google.maps.Size(21, 34),
              new google.maps.Point(0, 0),
              new google.maps.Point(10, 34),
              new google.maps.Size(21, 34));
            return markerImage;
          }

          // Style the markers a bit. This will be our listing marker icon.
          mapView.defaultIcon = makeMarkerIcon('0091ff');

          // Create a "highlighted location" marker color for when the user
          // mouses over the marker.
          mapView.highlightedIcon = makeMarkerIcon('FFFF24');

          mapView.createMarker = function(place, label) {
            var position = place.geometry.location;
            // Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
              position: position,
              title: place.name,
              // animation: google.maps.Animation.DROP,
              // icon: mapView.defaultIcon,
              label: label.toString()
            });
            marker.addListener('click', function() {
              mapView.populateInfoWindow(this, mapView.largeInfowindow, place);
            });

            return marker;
          };

          // This function will loop through the markers array and display them all.
          mapView.showMarkers = function (markers) {
            for (var i = 0; i < markers.length; i++) {
              markers[i].setMap(mapView.map);
            }
          };

          // This function will loop through the listings and hide them all.
          mapView.hideMarkers = function(markers) {
            for (var i = 0; i < markers.length; i++) {
              markers[i].setMap(null);
            }
          };

          function isInfoWindowOpen(infoWindow) {
            var map = infoWindow.getMap();
            return (map !== null && typeof map !== "undefined");
          }


          // This function populates the infowindow when the marker is clicked. We'll only allow
          // one infowindow which will open at the marker that is clicked, and populate based
          // on that markers position.
          mapView.populateInfoWindow = function(marker, infowindow, place) {
            // Check to make sure the infowindow is not already opened on this marker.
            if (infowindow.marker != marker) {
              if (!place || !place.geometry) {
                return;
              }
              // Clear the infowindow content to give the streetview time to load.
              infowindow.setContent('');
              infowindow.marker = marker;
              // Make sure the marker property is cleared if the infowindow is closed.
              var ctx = "";
              ctx += '<div>' + marker.title + '</div><div>地址:' + place.vicinity + '</div>';
              if (place.photos && place.photos.length > 0) {
                ctx += '<div><img src="' + place.photos[0].getUrl({ 'maxWidth': 100, 'maxHeight': 100 }) + '"/></div>'
              }
              ctx += '<div><a id="record-pos-button" href="javascript:void(0);"  onclick="app.openRecordModal(this);">添加记录</a></div>'
              ctx += '<div><a id="wish-pos-button" href="javascript:void(0);"  onclick="app.add2WishList(this);">添加心愿单</a></div>'
              infowindow.setContent(ctx);
              infowindow.open(map, marker);
              $("#record-pos-button").attr("data-place-id", place.place_id)
                .attr("data-name", place.name)
                .attr("data-vicinity", place.vicinity)
                .attr("data-location", place.geometry.location.toString());
              $("#wish-pos-button").attr("data-place-id", place.place_id)
                .attr("data-name", place.name)
                .attr("data-vicinity", place.vicinity)
                .attr("data-location", place.geometry.location.toString());
            }
          }
          mapView.geocoder = new google.maps.Geocoder();
          mapView.placesService = new google.maps.places.PlacesService(mapView.map);


          mapView.map.addListener('idle', mapView.searchNearby);
          $modalSetting.on("hidden.bs.modal", mapView.searchNearby);

          mapView.centerMarker = new google.maps.Marker({
            position: currentPosition,
            title: "我的位置",
            animation: google.maps.Animation.BOUNCE,
            icon: mapView.defaultIcon,
            map: mapView.map
          });

          // Two event listeners - one for mouseover, one for mouseout,
          // to change the colors back and forth.
          mapView.centerMarker.addListener('mouseover', function() {
            this.setIcon(mapView.highlightedIcon);
          });
          mapView.centerMarker.addListener('mouseout', function() {
            this.setIcon(mapView.defaultIcon);
          });

          resolve(mapView.map);
        }, function(err) {
          reject("load google map fail");
        });
      });
    }
  };

  mapView.searchNearby = function() {
    return new Promise(function(resolve, reject){
      var serachType = [];
      serachType.push($serachType.val());
      var searchOption = {
        bounds: mapView.map.getBounds(),
        types: serachType
      };
      mapView.placesService.nearbySearch(searchOption, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          mapView.hideMarkers(mapView.markers);
          mapView.markers = [];
          for (var i = 0; i < results.length; i++) {
            mapView.markers.push(mapView.createMarker(results[i], i));
          }
          mapView.showMarkers(mapView.markers);
          resolve();
        } else {
          reject("未查询到匹配地点, 你可以移动地图或缩放地图试试");
        }
      });              
    });
  };

  mapView.showVisitedPlace = function() {
    return new Promise(function(resolve, reject) {
      // 获取数据
      var locations = viewModel.getVisitedData();

      // 重新创建标记
      mapView.hideMarkers(mapView.visitedMarkers);
      mapView.visitedMarkers = [];
      for (var i = 0, marker; i < locations.length; i++) {
        marker = new google.maps.Marker({
          position: locations[i].location,
          title: locations[i].title,
          animation: google.maps.Animation.DROP,
          icon: mapView.highlightedIcon,
          map: mapView.map
        });
        mapView.visitedMarkers.push(marker);
      }
      resolve(mapView.map);
    });
  };

  mapView.loadErrorView = function(data) {
    return new Promise(function(resolve, reject) {
      $viewMap.find("#view-map-main").attr("hidden", "hidden");
      $viewMap.find("#view-map-main-error").removeAttr("hidden");
      resolve(data);
    });
  };

  mapView.clearMarks = function() {
    return new Promise(function(resolve, reject) {
      if (mapView.centerMarker) {
        mapView.centerMarker.setMap(null);
      }
      if (mapView.hideMarkers) {
        mapView.hideMarkers(mapView.markers);
        mapView.hideMarkers(mapView.visitedMarkers);
        mapView.markers = [];
        mapView.visitedMarkers = [];
      }
    });
  };

  app.mapView = mapView;

  // ---- map view end --------------------------------------------------------
  
  // 加载基本资源
  app.init = function() {
    return new Promise(function(resolve, reject) {
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
            deps: ['jquery']
          }
        }
      });

      requirejs(["knockout", "jquery", "underscore", "bootstrap"], function(ko) {
        $map = $("#map");
        $modalDelComfirm = $("#del-comfirm");
        $modalSetting = $("#setting");
        $modalRecordPos = $("#record-pos");
        $modalSearch = $("#search");
        $spinner = $("#loader");
        $serachType = $("#search-type");
        $spinner = $(".loader");
        $viewMap = $("#view-map");
        $viewHome = $("#view-home");
        $viewList = $("#view-list");

        $(".menu .fa-list-alt").on("click", function(e) {
          app.showListView();
        });

        $(".menu .fa-map-o").on("click", function(e) {
          app.showMapView();
        });

        $("header .fa-home").on("click", function(e) {
          mapView.clearMarks()
            .then(app.showMainView());
        });

        $viewMap.find(".fa-refresh").on("click", function(e) {
          app.showMapView();
        });

        resolve(ko);
      }, function(err) {
        console.error("err:", err);
        reject(Error("init fail", err));
      });
    });
  };

  // 开始转圈
  app.startLoad = function(data) {
    return new Promise(function(resolve, reject) {
      $("#set-center").attr("disabled", "disabled");
      if ($spinner) {
        $spinner.removeAttr("hidden");
      }
      resolve(data);
    });
  };

  // 结束转圈
  app.endLoad = function(data) {
    return new Promise(function(resolve, reject) {
      $("#set-center").removeAttr("disabled");
      $spinner.attr("hidden", "");
      resolve(data);
    });
  };

  // 显示地图视口
  app.showMapView = function() {
    return new Promise(function(resolve, reject) {
      app.startLoad()
        .then(function() {
          $viewMap.removeAttr("hidden");
          $viewHome.attr("hidden", "hidden");
          $viewList.attr("hidden", "hidden");
          $(".header .fa-home").removeAttr("hidden");
          $("[data-target='#setting']").removeAttr("hidden");
          $("[data-target='#serach-place-list']").removeAttr("hidden");
        })
        // .then(mapView.getCenterPosition)
        .then(function(pos) { // 如果获取不到当前位置, 则使用默认位置
          return { lat: 39.9653473, lng: 116.27073879999999 };
        })
        .then(mapView.showMap)
        .then(mapView.showVisitedPlace)
        .catch(mapView.loadErrorView)
        .then(app.endLoad)
        .then(function() {
          resolve();
        }).catch(function() {
          reject();
        });
    });
  };

  // 显示主视口
  app.showMainView = function() {
    return new Promise(function(resolve, reject) {
      app.startLoad()
        .then(function () {
          $viewHome.removeAttr("hidden");
          $viewMap.attr("hidden", "hidden");
          $viewList.attr("hidden", "hidden");
          $(".header .fa-home").attr("hidden", "hidden");
          $("[data-target='#setting']").attr("hidden", "hidden");
          $("[data-target='#serach-place-list']").attr("hidden", "hidden");
        })
        .then(app.endLoad)
        .then(function () {
          resolve();
        })
        .catch(function () {
          reject();
        });
    });
  };

  // 显示列表视口
  app.showListView = function() {
    return new Promise(function(resolve, reject) {
      app.startLoad()
        .then(function () {
          $viewList.removeAttr("hidden");
          $viewMap.attr("hidden", "hidden");
          $viewHome.attr("hidden", "hidden");
          $(".header .fa-home").removeAttr("hidden");
          $("[data-target='#setting']").attr("hidden", "hidden");
          $("[data-target='#serach-place-list']").attr("hidden", "hidden");
        })
        .then(app.endLoad)
        .then(function () {
          resolve();
        })
        .catch(function () {
          reject();
        });
    });
  };

  // 打开地点记录对话框
  app.openRecordModal = function(ele) {
    var $ele = $(ele);
    $modalRecordPos.modal("show");
  };

  app.add2WishList = function (ele) {
    var $ele = $(ele);
    var data = {};
    data.place_id = $ele.attr("data-place-id");
    data.name = $ele.attr("data-name");
    data.vicinity = $ele.attr("data-vicinity");
    data.location = $ele.attr("data-location");
    viewModel.addWishPlace(data);
  };

  app.init().then(viewModel.init);
  window.app = app;
}());
