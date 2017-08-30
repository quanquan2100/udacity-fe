(function() {
  // 常量
  var MAP_APP_KEY = "AIzaSyAjkLBg_PHjw5O4h8S9tAc_iSojq4BKA9s";

  var $map, $modalDelComfirm, $modalSetting, $modalRecordPos, $modalSearch, $modalSearchPlaceList, $spinner, $serachType, $viewMap, $viewHome, $viewList, $modalNotify;
  var app = {};


  // ---- viewModel begin --------------------------------------------------------
  var viewModel = {};
  viewModel.init = function(ko) {
    return new Promise(function(resolve, reject) {
      var visitedList = localStorage.getItem("visitedList");
      if (!visitedList) {
        visitedList = [];
        localStorage.setItem("visitedList", "[]");
      } else {
        visitedList = JSON.parse(visitedList);
      }
      var wishList = localStorage.getItem("wishList");
      if (!wishList) {
        wishList = [];
        localStorage.setItem("wishList", "[]");
      } else {
        wishList = JSON.parse(wishList);
      }
      var centerLat = localStorage.getItem("centerLat");
      var centerLng = localStorage.getItem("centerLng");
      if (!centerLat || !centerLng) {
        centerLat = 39.9653473;
        centerLng = 116.27073879999999;
      }
      var searchList = [];

      var vm = {
        view: ko.observable("main"),
        centerLocation: {
          lat: ko.observable(centerLat),
          lng: ko.observable(centerLng)
        },
        wishList: ko.observableArray(wishList),
        visitedList: ko.observableArray(visitedList),
        searchList: ko.observableArray(searchList),
        wikiList: ko.observableArray([]),
        selectedPlace: {
          id: ko.observable(""),
          name: ko.observable(""),
          place_id: ko.observable(""),
          vicinity: ko.observable(""),
          geometry: {
            location: {
              lat: ko.observable(""),
              lng: ko.observable("")
            }
          },
          time: ko.observable(""),
          description: ko.observable(""),
          tags: ko.observableArray([]),
          like: ko.observable(false)
        },
        delWishIndex: ko.observable(0),
        delVisitedIndex: ko.observable(0),
        showInfo: function(data, e) {
          $modalSearchPlaceList.modal("hide");
          mapView.largeInfowindow.close();
          mapView.populateInfoWindow(mapView.markers[data.index], mapView.largeInfowindow, data);
        },
        showDetail: function(data, e) { // 使用 wiki 百科查看详情
          app.showWiki(data.name);
        },
        setSelectedPlace: function(data, e) {
          var index = data.index;
          var data = viewModel.getSearchPlace(index);
          var id = Date.now();
          var time = new Date(id);
          vm.selectedPlace.id(id);
          vm.selectedPlace.time(time.toLocaleDateString() + " " + time.toLocaleTimeString());
          vm.selectedPlace.description("");
          vm.selectedPlace.tags([]);
          vm.selectedPlace.like(true);
          vm.selectedPlace.name(data.name);
          vm.selectedPlace.place_id(data.place_id);
          vm.selectedPlace.vicinity(data.vicinity);
          vm.selectedPlace.geometry.location.lat(data.geometry.location.lat);
          vm.selectedPlace.geometry.location.lng(data.geometry.location.lng);
        },
        addVisitedPlace: function(data, e) {
          vm.visitedList.push(ko.toJS(vm.selectedPlace))
          app.noty("已添加记录, 你可以进入列表界面查看");
        },
        showInMap: function(data, e) {
          app.showMapView(data.geometry.location);
        },
        setWishDelIndex: function(data, e) {
          vm.delWishIndex(ko.contextFor(e.currentTarget)["$index"]());
          $modalDelComfirm.modal("show");
        },
        setVisitedDelIndex: function(data, e) {
          vm.delVisitedIndex(ko.contextFor(e.currentTarget)["$index"]());
          $("#del-visited-comfirm").modal("show");
        },
        delWishItem: function(data, e) {
          var index = vm.delWishIndex();
          vm.wishList.splice(index, 1);
        },
        delVisitedItem: function(data, e) {
          var index = vm.delVisitedIndex();
          vm.visitedList.splice(index, 1);
        },
      };
      vm.wishList.subscribe(function(newValue) {
        localStorage.setItem("wishList", JSON.stringify(newValue));
      });
      vm.visitedList.subscribe(function(newValue) {
        localStorage.setItem("visitedList", JSON.stringify(newValue));
      });
      vm.centerLocation.lat.subscribe(function(newValue) {
        localStorage.setItem("centerLat", newValue);
      });
      vm.centerLocation.lng.subscribe(function(newValue) {
        localStorage.setItem("centerLng", newValue);
      });
      ko.applyBindings(vm);
      viewModel.vm = vm;
      resolve(vm);
    });
  };
  viewModel.getVisitedData = function() {
    return viewModel.vm.visitedList();
  };
  viewModel.setCenterPlace = function(centerPlace) {
    viewModel.centerLocation.lat(centerPlace.lat);
    viewModel.centerLocation.lng(centerPlace.lng);
  }
  viewModel.addWishPlace = function(data) {
    viewModel.vm.wishList.push(data);
  };
  viewModel.getSearchPlace = function(index) {
    return viewModel.vm.searchList()[index];
  };
  viewModel.getCenterLocation = function() {
    return {
      lat: viewModel.vm.centerLocation.lat(),
      lng: viewModel.vm.centerLocation.lng()
    };
  };
  // viewModel.addVisitedPlace = function(data) {
  //   viewModel.vm.visitedList.push(data);
  // };
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

  mapView.getCenterPosition = function(place) {
    return new Promise(function(resolve, reject) {
      if (place) {
        resolve(place);
        return;
      }
      // Try HTML5 geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          viewModel.vm.centerLocation.lat(position.coords.latitude);
          viewModel.vm.centerLocation.lng(position.coords.longitude);
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
      mapView.centerMarker.setAnimation(google.maps.Animation.BOUNCE);

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
            if (place.name === "") {
              app.startLoad()
                .then(mapView.getCenterPosition)
                .catch(function(pos) { // 如果获取不到当前位置, 则使用默认位置
                  return { lat: 39.9653473, lng: 116.27073879999999 };
                })
                .then(function(pos) {
                  mapView.centerMarker.setPosition(pos)
                  mapView.map.setCenter(pos);
                  mapView.map.setZoom(15);
                })
                .then(app.endLoad);
            } else if (!place.geometry) {
              app.noty("需要选择列表中的具体地点哦");
              return;
            } else {
              mapView.centerMarker.setPosition(place.geometry.location)
              mapView.map.setCenter(place.geometry.location);
              mapView.map.setZoom(15);
            }
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

          mapView.defaultIcon = makeMarkerIcon('0091ff');

          mapView.highlightedIcon = makeMarkerIcon('FFFF24');

          mapView.createMarker = function(place, index) {
            var position = place.geometry.location;
            // Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
              position: position,
              title: place.name,
              // animation: google.maps.Animation.DROP,
              // icon: mapView.defaultIcon,
              id: index,
              label: index.toString()
            });
            marker.addListener('click', function() {
              mapView.populateInfoWindow(this, mapView.largeInfowindow, place);
            });

            return marker;
          };

          // This function will loop through the markers array and display them all.
          mapView.showMarkers = function(markers) {
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

          // function isInfoWindowOpen(infoWindow) {
          //   var map = infoWindow.getMap();
          //   return (map !== null && typeof map !== "undefined");
          // }


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
    return new Promise(function(resolve, reject) {
      var map = mapView.largeInfowindow.getMap();
      if (map !== null && typeof map !== "undefined") {
        return;
      }

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
          var searchList = [];
          for (var i = 0; i < results.length; i++) {
            mapView.markers.push(mapView.createMarker(results[i], i));
            searchList.push({
              index: i,
              name: results[i].name,
              vicinity: results[i].vicinity,
              geometry: {
                location: {
                  lat: results[i].geometry.location.lat(),
                  lng: results[i].geometry.location.lng()
                }
              },
              place_id: results[i].place_id
            });
          }
          mapView.showMarkers(mapView.markers);
          viewModel.vm.searchList(searchList);
          resolve();
        } else {
          app.noty("未查询到匹配地点, 你可以移动地图或缩放地图试试");
          reject("未查询到匹配地点, 你可以移动地图或缩放地图试试");
        }
      });
    });
  };

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
      ctx += '<div><a data-index="' + marker.id + '" id="record-pos-button" href="javascript:void(0);"  onclick="app.add2VisitedList(this);">添加记录</a></div>'
      ctx += '<div><a data-index="' + marker.id + '" id="wish-pos-button" href="javascript:void(0);"  onclick="app.add2WishList(this);">添加心愿单</a></div>'
      ctx += '<div><a data-name="' + place.name + '" id="wish-pos-button" href="javascript:void(0);"  onclick="app.showWiki(\'' + place.name + '\');">查看相关内容</a></div>'
      infowindow.setContent(ctx);
      infowindow.open(map, marker);
    } else {
      infowindow.close();
      infowindow.open(mapView.map, marker);
    }
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
          // tether: "tether/dist/js/tether", // 由于 bootstrap 使用其全局变量, 导致不适用于 require.
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
        $modalNotify = $("#notify");
        $modalSearchPlaceList = $("#search-place-list");

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

        $modalNotify.on("show.bs.modal", function(e) {
          setTimeout(function() {
            $modalNotify.modal("hide");
          }, 1000);
        });

        $modalDelComfirm.find(".confirm").on("click", function(e) {
          $modalDelComfirm.data("result", true);
        });

        $modalRecordPos.find(".confirm").on("click", function(e) {
          $modalRecordPos.data("record", true);
          $modalRecordPos.modal("hide");
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
  app.showMapView = function(place) {
    return new Promise(function(resolve, reject) {
      app.startLoad(place)
        .then(function(data) {
          viewModel.vm.view("map");
          return data;
        })
        .then(mapView.getCenterPosition)
        .catch(function(err) { // 如果获取不到当前位置, 则使用存储的位置
          return viewModel.getCenterLocation();
        })
        .then(mapView.showMap)
        .then(mapView.showVisitedPlace)
        .catch(mapView.loadErrorView)
        .then(app.endLoad)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          if (err) {
            app.noty(err);
          }
          reject(err);
        });
    });
  };

  // 显示主视口
  app.showMainView = function() {
    return new Promise(function(resolve, reject) {
      app.startLoad()
        .then(function() {
          viewModel.vm.view("main");
        })
        .then(app.endLoad)
        .then(function() {
          resolve();
        })
        .catch(function() {
          reject();
        });
    });
  };

  // 显示列表视口
  app.showListView = function() {
    return new Promise(function(resolve, reject) {
      app.startLoad()
        .then(function() {
          viewModel.vm.view("list");
        })
        .then(app.endLoad)
        .then(function() {
          resolve();
        })
        .catch(function() {
          reject();
        });
    });
  };

  // 打开地点记录对话框
  app.openRecordModal = function(ele) {
    var $ele = $(ele);
    $modalRecordPos.modal("show");
  };

  app.add2WishList = function(ele) {
    var $ele = $(ele);
    var index = parseInt($ele.attr("data-index"));
    var data = viewModel.getSearchPlace(index);
    viewModel.addWishPlace(data);
    app.noty("成功加入心愿单");
  };

  app.add2VisitedList = function(ele) {
    var $ele = $(ele);
    var index = parseInt($ele.attr("data-index"));
    var data = viewModel.getSearchPlace(index);
    viewModel.vm.setSelectedPlace(data);
    $modalRecordPos.modal("show");
  };

  // 显示通知, 通知会自动关闭
  app.noty = function(text) {
    $modalNotify.find(".ctx").html(text);
    $modalNotify.modal("show");
  };

  app.getWikiData = function(name) {
    return new Promise(function(resolve, reject) {
      var wikiUrl = 'http://zh.wikipedia.org/w/api.php?action=opensearch&search=' + name + '&format=json';
      var wikiRequestTimeout = setTimeout(function() {
        app.noty("暂未查到相关内容");
      }, 8000);

      $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function(response) {
          var articleList = response[1];
          var list = [];

          for (var i = 0, item; i < articleList.length; i++) {
            item = {
              title: response[1][i],
              description: response[2][i],
              href: response[3][i]
            }
            list.push(item);
          };
          clearTimeout(wikiRequestTimeout);
          resolve(list);
        },
        fail: function() {
          reject();
        },
        error: function() {
          reject();
        }
      });
    });
  };

  app.showWiki = function(name) {
    app.startLoad(name)
      .then(function (name) {
        $("#wiki-list").modal("show");
        return name;
      })
      .then(app.getWikiData)
      .then(function (data) {
        viewModel.vm.wikiList(data);
      })
      .catch(function () {
        viewModel.vm.wikiList([]);
      })
      .then(app.endLoad)
      .catch(app.endLoad);
  };

  app.init().then(viewModel.init);


  window.viewModel = viewModel;
  window.app = app;
}());