var googleMapMarkersWidget = function (settings) {
        var self = this;
        var currentSettings = settings;
        var map;
        var markers = [];
        var currentPosition = {};
        var apiKey = currentSettings.api_key;

        this.render = function (element) {
            function initializeMap() {
                var mapOptions = {
                    zoom: 13,
                    center: new google.maps.LatLng(30.267782, -97.747382)
                };

                map = new google.maps.Map(element, mapOptions);

                google.maps.event.addDomListener(element, 'mouseenter', function (e) {
                    e.cancelBubble = true;
                    if (!map.hover) {
                        map.hover = true;
                        map.setOptions({zoomControl: true});
                    }
                });

                google.maps.event.addDomListener(element, 'mouseleave', function (e) {
                    if (map.hover) {
                        map.setOptions({zoomControl: false});
                        map.hover = false;
                    }
                });

            }

            if (window.google && window.google.maps) {
                initializeMap();
            }
            else {
                window.gmap_initialize = initializeMap;
                head.js("https://maps.googleapis.com/maps/api/js?v=3.exp&key="+apiKey+"&sensor=false&callback=gmap_initialize");
            }
        }

        this.onSettingsChanged = function (newSettings) {
            currentSettings = newSettings;
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            for (var i = 0; i < newValue.length; i++) {
                newcoordinate = new google.maps.LatLng(newValue[i].latitude, newValue[i].longitude);
                if (markers[newValue[i].name] && markers[newValue[i].name].setPosition){
                  markers[newValue[i].name].setPosition(newcoordinate);
                }
                else {
                 var marker =  new google.maps.Marker({
                    map:map
                  });
                  marker.setPosition(newcoordinate);
                  markers[newValue[i].name] = marker;
                }
          }
        }

        this.onDispose = function () {
        }

        this.getHeight = function () {
            return 5;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "google_map_markers",
        display_name: "Google Map Markers",
        fill_size: true,
        settings: [
            {
                name: "latlong",
                display_name: "Location Source",
                type: "calculated",
                required : true
            },
            {
                "name"         : "api_key",
                "display_name" : "API Key",
                "type"         : "text",
                "required"     : true
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new googleMapMarkersWidget(settings));
        }
    });