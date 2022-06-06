
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

function convertAveTime(aveTime) {
    let min = Math.floor(aveTime / 60);
    let sec = Math.floor(aveTime % 60);
    let pmin = ( '00' + min ).slice( -2 );
    let psec = ( '00' + sec ).slice( -2 );

    return pmin + '分' + psec + '秒 / キロ';
}

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

window.onload = function() {
    var userId;
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log('logged in');
            userId = user.uid;
    
            console.log(userId);

            let userRef = db.collection('users').doc(userId);
            userRef.get().then((doc) => {
                if (doc.exists) {
                } else {
                    window.location.href = "./register.html";
                }
            }).catch((error) => {
                window.location.href = "./register.html";
            });
    
            db.collection("workouts").where("uid", "==", userId)
            .orderBy("date", "desc").limit(10)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    let data = doc.data();
                    let date = data.date.toDate();
                    let dateText = date.toLocaleDateString('ja-JP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    let timeText = date.toLocaleTimeString('ja-JP');
                    let dateTimeText = dateText + timeText;
                    let distance = data.distance;
                    let time = sec2str(data.time);
                    let ave = convertAveTime(data.ave);
                    let gpsHist = data.map;
    
                    let html = `<div class="workout-child">
                        <div class="date">` + dateTimeText + `</div>
                        <div class="map"></div>
                        <div class="distance">走行距離　` + distance.toFixed(2) + `KM</div>
                        <div class="time">経過時間　` + time + `</div>
                        <div class="ave">平均速度　` + ave + `</div>
                    </div>`;
    
                    let child = $(html).appendTo('.workout-list');
                    console.log(doc.id, " => ", doc.data());
    
                    let map = new Microsoft.Maps.Map(child.find('.map').get(0), {
                        mapTypeId: Microsoft.Maps.MapTypeId.road,
                        enableSearchLogo: false,
                        enableClickableLogo:false,
                        showDashboard:false,
                        scrollwheel: false,
                        disableDefaultUI: true,
                        zoom: 15,
                    });
    
                    let coords = [];
                    for(let i = 0; i < gpsHist.length; i++) {
                        let location = new Microsoft.Maps.Location(gpsHist[i].lat, gpsHist[i].lng);
                        coords.push(location);
                    }
    
                    //Create a polyline
                    let line = new Microsoft.Maps.Polyline(coords, {
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
                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
        } else {
            window.location.href = "./index.html";
        } 
    });
}


$('.logout-button').on('click', function() {
firebase.auth().signOut().then(()=>{
    window.location.href = "./index.html";
    })
    .catch( (error)=>{
    window.location.href = "./index.html";
    });
});



