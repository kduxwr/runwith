var firebaseConfig = {
    apiKey: "AIzaSyCr9eiIN966ucGKJfw4rdo_RncpFvCfbdU",
    authDomain: "runwith-9be83.firebaseapp.com",
    projectId: "runwith-9be83",
    storageBucket: "runwith-9be83.appspot.com",
    messagingSenderId: "683736651114",
    appId: "1:683736651114:web:ef9bf56c84355609b78113",
    measurementId: "G-X1NCY7LC7S"
    };
    
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const gdb = new GeoFirestore(db);
const collection = gdb.collection('workouts');

var userId;
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log('logged in');
        userId = user.uid;

        let userRef = db.collection('users').doc(userId);
        userRef.get().then((doc) => {
            if (doc.exists) {
            } else {
                window.location.href = "./register.html";
            }
        }).catch((error) => {
            window.location.href = "./register.html";
        });
    } else {
        window.location.href = "./index.html";
    } 
  });

$('.pause-button').hide();
$('.restart-button').hide();
$('.end-button').hide();
$('.countdown').hide();
$('.info').hide();

$('.workresult').hide();

let countdownVal = 3;
let countupVal = 0;

function sec2str(second) {
    let min = Math.floor(second / 60);
    let sec = Math.floor(second % 60);
    let hour = Math.floor(min / 60);
    min = Math.floor(min % 60);
    let phour = ( '00' + hour ).slice( -2 );
    let pmin = ( '00' + min ).slice( -2 );
    let psec = ( '00' + sec ).slice( -2 );
    return (phour + ':' + pmin + ':' + psec);
}

function countupIntervalFunc() {
    countupVal++;
    let min = Math.floor(countupVal / 60);
    let sec = Math.floor(countupVal % 60);
    let hour = Math.floor(min / 60);
    min = Math.floor(min % 60);
    let phour = ( '00' + hour ).slice( -2 );
    let pmin = ( '00' + min ).slice( -2 );
    let psec = ( '00' + sec ).slice( -2 );
    $('.countup').text(phour + ':' + pmin + ':' + psec);
}

var gpsHist = [];
var latlng;
var speed;
var totalDistance = 0;

function getGps(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    latlng = {lat: lat, lng: lng};
    speed = position.coords.speed;
}

function distance(lat1, lng1, lat2, lng2) {
    lat1 *= Math.PI / 180;
    lng1 *= Math.PI / 180;
    lat2 *= Math.PI / 180;
    lng2 *= Math.PI / 180;
    return 6371 * Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) + Math.sin(lat1) * Math.sin(lat2));
}

function gpsIntervalFunc() {
    if(0 < gpsHist.length) {
        let prev = gpsHist.slice(-1)[0];
        let d = distance(latlng.lat, latlng.lng, prev.lat, prev.lng);
        gpsHist.push(latlng);

        if(!Number.isNaN(d)) {
            
            totalDistance += d;
            console.log(totalDistance);
            $('.distance').text(totalDistance.toFixed(2) + 'KM');
            $('.lat').text(latlng.lat);
            $('.lng').text(latlng.lng);
            if(speed == null || speed == 0) {
                $('.speed').text('ー');
            } else {
                let speedConvert = 1 / speed * 1000;
                smin = Math.floor(speedConvert / 60);
                ssec = Math.floor(speedConvert % 60);
                speedText = smin + '分' + ssec + '秒 / キロ';
                $('.speed').text(speedText);
            }
        }
    } else {
        gpsHist.push(latlng);
    }   
}

var countupInterval;
var gpsInterval;

$('.start-button').on('click', function() {
    $('.start').hide();
    $('.dummy-button').hide();
    $('.workinput-button').hide();
    $('.start-button').hide();
    $('.countdown').show();
    $('.countdown').text(countdownVal);
    var countdownInterval = setInterval(function() {
        countdownVal--;
        $('.countdown').text(countdownVal);
        if(countdownVal == 0) {
            clearInterval(countdownInterval);
            $('.pause-button').show();
            $('.end-button').show();
            $('.countdown').hide();
            $('.info').show();
            $('.countup').text(sec2str(countupVal));
            $('.distance').text(totalDistance.toFixed(2) + 'KM');
            countupInterval = setInterval(countupIntervalFunc, 1000);
            gpsInterval = setInterval(gpsIntervalFunc, 1000);
        }
    }, 1000);
});

$('.pause-button').on('click', function() {
    $('.pause-button').hide();
    $('.restart-button').show();
    clearInterval(countupInterval);
    clearInterval(gpsInterval);
});

$('.restart-button').on('click', function() {
    $('.restart-button').hide();
    $('.pause-button').show();
    countupInterval = setInterval(countupIntervalFunc, 1000);
    gpsInterval = setInterval(gpsIntervalFunc, 1000);
});

const option = {
    enableHighAccuracy: true,
    maximumAge: 20000,
    timeout: 1000000,
};
function showError(error) {
    let e = '';
    if(error.code == 1) {
    e = '位置情報が許可されていません';
    } else if(error.code == 2) {
    e = '現在位置を特定できません';
    } else if(error.code == 3) {
    e = '位置情報を取得する前にタイムアウトになりました';
    }
    alert('error:' + e);
}

var watchId;
var map;
window.onload = function () {
    watchId = navigator.geolocation.watchPosition(getGps, showError ,option);
}

$('.end-button').on('click', function() {
    console.log('end');
    clearInterval(gpsInterval);
    clearInterval(countupInterval);
    navigator.geolocation.clearWatch(watchId);

    $('.workout').hide();
    $('.workresult').show();

    const clat = gpsHist[0].lat;
    const clng = gpsHist[0].lng;
    map = new Microsoft.Maps.Map('.map', {
    center: {
        latitude: clat, longitude: clng,
    },
    mapTypeId: Microsoft.Maps.MapTypeId.road,
    enableSearchLogo: false,
    enableClickableLogo:false,
    showDashboard:false,
    zoom: 15,
    });
    // pushPin(lat, lng, map);
    // generateInfobox(lat, lng, map);

    //線
    var locations = [];
    
    
    //Create array of locations
    var coords = [];
    for(let i = 0; i < gpsHist.length; i++) {
        let location = new Microsoft.Maps.Location(gpsHist[i].lat, gpsHist[i].lng);
        coords.push(location);
    }

    console.log(coords);
    console.log(gpsHist);

    //Create a polyline
    var line = new Microsoft.Maps.Polyline(coords, {
        strokeColor: 'red',
        strokeThickness: 3,
        //strokeDashArray: [4, 4]
    });

    //Add the polyline to map
    map.entities.push(line);

    map.setView({
        bounds: Microsoft.Maps.LocationRect.fromLocations(coords),
        padding: 8 //Add a padding to buffer map to account for pushpin pixel dimensions
    });

    $('.record .distance').text(totalDistance.toFixed(2) + 'KM');
    $('.record .time').text(sec2str(countupVal));

    let aveTime = Math.floor(countupVal / totalDistance);

    let min = Math.floor(aveTime / 60);
    let sec = Math.floor(aveTime % 60);
    let pmin = ( '00' + min ).slice( -2 );
    let psec = ( '00' + sec ).slice( -2 );
    $('.record .speed').text(pmin + '分' + psec + '秒 / キロ');

    let center = map.getCenter();
    let lat = center.latitude;
    let lng = center.longitude;
    let date = new Date();

    collection.add({
        uid: userId,
        date: date,
        distance: totalDistance,
        time: countupVal,
        ave: aveTime,
        coordinates: new firebase.firestore.GeoPoint(lat, lng),
        map: gpsHist,
    });

});

function generateInfobox(lat, lng, now) {
    const location = new Microsoft.Maps.Location(lat, lng);
    const infobox = new Microsoft.Maps.Infobox(location, {
        title: 'イマココ',
        description: "I'm here!!!",
    });
    infobox.setMap(now);
}
function pushPin(lat, lng, now) {
    const location = new Microsoft.Maps.Location(lat, lng);
    const pin = new Microsoft.Maps.Pushpin(location, {
        color: 'navy',
        visible: true,
    });
    now.entities.push(pin);
}

