$(document).ready(function() {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBtOVuhH_xZpkcRvYSfmLEBtAZ5VdtbbVE",
        authDomain: "gds-map-submit.firebaseapp.com",
        databaseURL: "https://gds-map-submit.firebaseio.com",
        projectId: "gds-map-submit",
        storageBucket: "gds-map-submit.appspot.com",
        messagingSenderId: "39444318896"
    };
    firebase.initializeApp(config);

    var database = firebase.database();

    // declare variables for map
    var fLat = 0;
    var fLon = 0;
    var mymap = "";

    // create map container setting focus on location and zoom level
    mymap = L.map("mapid").setView([35.065017, -80.782693], 14);
    // add marker for location to map
    // var marker = L.marker([35.065017, -80.782693]).addTo(mymap);
    // // create popup at marker location
    // marker.bindPopup("<h4>BakeSale2Go is here!</h4>").openPopup();

    // mapLink =
    //     '<a href="https://openstreetmap.org">OpenStreetMap</a>';
    // L.tileLayer(
    //     'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //         attribution: '&copy; ' + mapLink + ' Contributors',
    //         maxZoom: 18,
    //     }).addTo(mymap);

    // map tiles (style) to use
    mapLink =
        '<a href="#">ESRI 2017</a>';
    L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
            maxZoom: 18,
        }).addTo(mymap);

    // mapLink =
    //     '<a href="http://stamen.com">Stamen Design</a>';
    // L.tileLayer(
    //     'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
    //         attribution: '&copy; ' + mapLink + ' Contributors',
    //         maxZoom: 18,
    //     }).addTo(mymap);

    function mapMe() {
        var userPositionPromise = new Promise(function(resolve, reject) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(data) {
                    resolve(data);
                }, function(error) {
                    reject(error);
                });
            } else {
                reject({
                    error: 'browser doesn\'t support geolocation'
                });
            };
        });

        userPositionPromise
            .then(function(data) {
                fLat = data.coords.latitude;
                fLon = data.coords.longitude;

                var umarker = L.marker([fLat, fLon]).addTo(mymap);
                umarker.bindPopup("<h4>You are here</h4>").openPopup();

            })
            .catch(function(error) {
                console.log('Error', error);
            });
    };

    function exportMap() {
        var exMap = editableLayers.toGeoJSON();
        console.log(exMap);
        database.ref().push({
            geoJson: exMap
        });

        var geoJson_string = JSON.stringify(exMap);

        emailjs.sendForm("default_service", "gds_map", { geoJson_string: geoJson_string });

    }

    var editableLayers = new L.FeatureGroup();
    mymap.addLayer(editableLayers);

    var MyCustomMarker = L.Icon.extend({
        options: {
            shadowUrl: null,
            iconAnchor: new L.Point(12, 12),
            iconSize: new L.Point(24, 24)
                // iconUrl: 'link/to/image.png'
        }
    });

    var options = {
        position: 'topright',
        draw: {
            polyline: {
                shapeOptions: {
                    color: '#f357a1',
                    weight: 10
                }
            },
            polygon: {
                allowIntersection: true,
                shapeOptions: {
                    color: '#red'
                }
            },
            circle: false, // Turns off this drawing tool
            rectangle: {
                shapeOptions: {
                    clickable: false
                }
            },
            marker: {
                // icon: new MyCustomMarker()
            }
        },
        edit: {
            featureGroup: editableLayers, //REQUIRED!!
            remove: false
        }
    };

    var drawControl = new L.Control.Draw(options);
    mymap.addControl(drawControl);

    mymap.on('draw:created', function(event) {
        var layer = event.layer,
            feature = layer.feature = layer.feature || {};

        feature.type = feature.type || "Feature";
        var props = feature.properties = feature.properties || {};
        props.desc = null;
        props.image = null;
        editableLayers.addLayer(layer);
        addPopup(layer);
    });

    function addPopup(layer) {


        var content = document.createElement("h5"); 
        var t = document.createTextNode("Name/ID:"); 
        content.appendChild(t); 
        var lb = document.createElement("br"); 
        content.appendChild(lb); 
        var ta = document.createElement("input");
        content.appendChild(ta); 

        content.addEventListener("keyup", function() {
            layer.feature.properties.desc = content.value;
        });
        layer.on("popupopen", function() {
            content.value = layer.feature.properties.desc;
            content.focus();
        });
        layer.bindPopup(content).openPopup();
    }


    $(document).on("click", "#locMe", mapMe);
    $(document).on("click", "#exportMap", exportMap);
});
