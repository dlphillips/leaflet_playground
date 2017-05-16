$(document).ready(function() {

    // todo
    // display list of maps in html
    // select and view in leaflet

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

    // mapLink =
    //     '<a href="#">ESRI 2017</a>';
    // L.tileLayer(
    //     'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png', {
    //         attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
    //         maxZoom: 18,
    //     }).addTo(mymap);


    var mapLayer = MQ.mapLayer(),
        map;

    // mymap = L.map("mapid").setView([39.102242, -94.665011], 5);

    mymap = L.map('mapid', { layers: mapLayer, center: [ 39.102242, -94.665011 ], zoom: 5 });

    L.control.layers({
        'Map': mapLayer,
        'Hybrid': MQ.hybridLayer(),
        'Satellite': MQ.satelliteLayer(),
        'Dark': MQ.darkLayer(),
        'Light': MQ.lightLayer()
    }).addTo(mymap);

    L.easyButton('<span class="glyphicon glyphicon-screenshot"></span>', function(btn, mymap) {
        mapMe();
    }).addTo(mymap);

    L.Control.geocoder().addTo(mymap);

    // gmaps: AIzaSyD6VFgAz1CR2V0IaKvA_zmGFZkFqpt6vNk

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
            }
        });

        userPositionPromise
            .then(function(data) {
                fLat = data.coords.latitude;
                fLon = data.coords.longitude;

                mymap.setView([fLat, fLon], 11);
                var umarker = L.marker([fLat, fLon]).addTo(mymap);
                umarker.bindPopup("<h4>You are here</h4>").openPopup();

            })
            .catch(function(error) {
                console.log('Error', error);
            });
    }

    var editableLayers = new L.FeatureGroup();
    mymap.addLayer(editableLayers);

    function exportMap() {
        event.preventDefault();
        var exMap = editableLayers.toGeoJSON();
        console.log(exMap);
        var formatexMap = JSON.stringify(editableLayers.toGeoJSON(), null, 2);
        console.log(formatexMap);
        database.ref().push({
            geoJson: exMap
        });

        var geoJson_string = JSON.stringify(exMap);

        var fFullname = $("#full_name_id").val().trim();
        var fEmail = $("#email_id").val().trim();
        var fStreet1 = $("#street1_id").val().trim();
        var fStreet2 = $("#street2_id").val().trim();
        var fCity = $("#city_id").val().trim();
        var fState = $("#state_id").val().trim();
        var fZip = $("#zip_id").val().trim();

        console.log(fFullname, fEmail, fStreet1, fStreet2, fCity, fState, fZip);
        // emailjs.send("default_service", "gds_map", { geoJson_string: geoJson_string });
    }

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
                    // color: '#red',
                    // weight: 10
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
        var content = document.createElement("textarea");
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
