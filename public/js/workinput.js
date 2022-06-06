
$('.workinput-result').hide();

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




var map;

const option = {
    enableHighAccuracy: true,
    maximumAge: 20000,
    timeout: 1000000,
};
function mapsInit(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    map = new Microsoft.Maps.Map('.map', {
      center: {
        latitude: lat, longitude: lng,
      },
      mapTypeId: Microsoft.Maps.MapTypeId.road,
      enableSearchLogo: false,
      enableClickableLogo:false,
      showDashboard:false,
      zoom: 15,
    });
  }
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


window.onload = function () {
    console.log('aaa');
    navigator.geolocation.getCurrentPosition(mapsInit, showError, option);
}

$('.workinput-exe-button').on('click', function() {
    var center = map.getCenter();
    console.log(center);
    let lat = center.latitude;
    let lng = center.longitude;
    let date = new Date();
    let mapCenter = {lat, lng};
    let distance = Number($('.input-distance').val());
    let min = Number($('.input-min').val());
    let sec = Number($('.input-sec').val());
    let time = min * 60 + sec;
    let ave = Math.floor(time / distance);
    collection.add({
        uid: userId,
        date: date,
        distance: distance,
        time: time,
        ave: ave,
        coordinates: new firebase.firestore.GeoPoint(lat, lng),
        map: [mapCenter],
    });
    $('.map').hide();
    $('.record').hide();
    $('.workinput-exe-button').hide();
    $('.workinput-result').show();
});

