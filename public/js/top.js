// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

const provider = new firebase.auth.GoogleAuthProvider();

$('.login-button').on('click', function() {
    firebase.auth().signInWithPopup(provider).then(result => {
        // GoogleプロパイダのOAuthトークンを取得します。
        const token = result.credential.accessToken;
        // ログインしたユーザーの情報を取得します。
        const user = result.user;

        window.location.href = "./home.html";
    }).catch(function(err) {
        console.error(err);
        // エラー処理
    });
});

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        let userRef = db.collection('users').doc(user.uid);
        userRef.get().then((doc) => {
            if (doc.exists) {
                window.location.href = "./home.html";
            } else {
                window.location.href = "./register.html";
            }
        });
    } else {
        console.log('not logged in');
    } 
});