
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

var userId;
var aite_id;
window.onload = function() {
    $('.non-chat-list').hide();
    $('.message-sender').hide();

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log('logged in');
            userId = user.uid;
    
            console.log(userId);

            let userRef = db.collection('users').doc(userId);
            userRef.get().then( async (doc) => {
                if (doc.exists) {
                    let urlHash = location.hash;
                    let user_id = urlHash.slice(1);
                    if(urlHash) {
                        $('.chat-list').hide();
                        $('.message-list').show();
                        $('.message-list').empty();
                        $('.message-sender').show();
                        $('.message-sender input').val('');

                        let chat_id = user_id;
                        aite_id = chat_id;

                        var count = 0;
                                        
                        await db.collection("users").doc(userId).collection('chat').doc(chat_id).collection('message')
                        .orderBy("date").limit(20).get()
                        .then((querySnapshot) => {
                            console.log(querySnapshot);
                            count = querySnapshot.size;
                            if(0 < querySnapshot.size) {
                                querySnapshot.forEach((doc) => {
                                    let data = doc.data();
                                    console.log(data);
                                    let message = data.message;

                                    let html;
                                    if(data.isMine) {
                                        html = '<div class="message-child mine">' + message + '</div>';
                                        $(html).appendTo('.message-list');
                                    } else {
                                        html = '<div class="message-child other">' + data.message + '</div>';
                                        $(html).appendTo('.message-list');
                                    }
                                });
                            }
                        });
                                        
                        await db.collection("users").doc(userId).collection('chat')
                        .doc(chat_id).collection('message')
                        .onSnapshot((snapshot) => {
                            snapshot.docChanges().forEach((change) => {
                                if (change.type === "added") {
                                    let data = change.doc.data();
                                    if(!data.isMine && 0 == count) {
                                        
                                        html = '<div class="message-child other">' + data.message + '</div>';
                                        $(html).appendTo('.message-list');
                                    }
                                    count--;
                                    console.log(count);
                                }
                            });
                        });    
                    } else {

                    db.collection("users").doc(userId).collection('chat')
                    .get()
                    .then((querySnapshot) => {
                        console.log(querySnapshot);
                        if(0 < querySnapshot.size) {
                            querySnapshot.forEach((doc) => {
                                let data = doc.data();
                                let uid = data.uid;
                                console.log(data);

                                let userRef = db.collection('users').doc(uid);
                                userRef.get().then((doc) => {
                                    let data = doc.data();
                                    let name = data.display_name;
                                    let html = '<div class="chat-child">' + name + '<button class="' + uid + '">メッセージ</button></div>';
                                    let added = $(html).appendTo('.chat-list');
                                    added.find('button').on('click', async function() {
                                        $('.chat-list').hide();
                                        $('.message-list').show();
                                        $('.message-list').empty();
                                        $('.message-sender').show();
                                        $('.message-sender input').val('');

                                        let chat_id = $(this).attr('class');
                                        aite_id = chat_id;

                                        var count = 0;
                                        
                                        await db.collection("users").doc(userId).collection('chat').doc(chat_id).collection('message')
                                        .orderBy("date").limit(20).get()
                                        .then((querySnapshot) => {
                                            console.log(querySnapshot);
                                            count = querySnapshot.size;
                                            if(0 < querySnapshot.size) {
                                                querySnapshot.forEach((doc) => {
                                                    let data = doc.data();
                                                    console.log(data);
                                                    let message = data.message;

                                                    let html;
                                                    if(data.isMine) {
                                                        html = '<div class="message-child mine">' + message + '</div>';
                                                        $(html).appendTo('.message-list');
                                                    } else {
                                                        html = '<div class="message-child other">' + data.message + '</div>';
                                                        $(html).appendTo('.message-list');
                                                    }
                                                });
                                            }
                                        });
                                        
                                        await db.collection("users").doc(userId).collection('chat')
                                        .doc(chat_id).collection('message')
                                        .onSnapshot((snapshot) => {
                                            snapshot.docChanges().forEach((change) => {
                                                if (change.type === "added") {
                                                    let data = change.doc.data();
                                                    if(!data.isMine && 0 == count) {
                                                        
                                                        html = '<div class="message-child other">' + data.message + '</div>';
                                                        $(html).appendTo('.message-list');
                                                    }
                                                    count--;
                                                    console.log(count);
                                                }
                                            });
                                        });


                                        // let aite_id = $(this).attr('class');
                                        // let date = new Date();
                                        // await db.collection('users').doc(userId).collection('chat').doc(aite_id).set({
                                        //     uid: aite_id,
                                        // });
                                        // await db.collection('users').doc(aite_id).collection('chat').doc(userId).set({
                                        //     uid: userId,
                                        // });
                                        // await db.collection('users').doc(userId).collection('chat').doc(aite_id).collection('message').add({
                                        //     uid: aite_id,
                                        //     isMine: true,
                                        //     date: date,
                                        //     message: 'トークルームを開設しました。',
                                        // });
                                        // await db.collection('users').doc(aite_id).collection('chat').doc(userId).collection('message').add({
                                        //     uid: userId,
                                        //     isMine: false,
                                        //     date: date,
                                        //     message: 'トークルームを開設しました。',
                                        // });
                                    });
                                }).catch((error) => {
                                    
                                });
           
                                
                            });
                        
                        } else {
                            $('.non-chat-list').show();
                        }
                    })
                    .catch((error) => {
                        console.log("Error getting documents: ", error);
                    });
                }
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
}

$('.message-sender button').on('click', async function() {
    let message = await $('.message-sender input').val();
    let date = new Date();
    await db.collection('users').doc(userId).collection('chat').doc(aite_id).collection('message').add({
        uid: aite_id,
        isMine: true,
        date: date,
        message: message,
    });
    await db.collection('users').doc(aite_id).collection('chat').doc(userId).collection('message').add({
        uid: userId,
        isMine: false,
        date: date,
        message: message,
    });

    $('.message-sender input').val('');
    html = '<div class="message-child mine">' + message + '</div>';
    $(html).appendTo('.message-list');
});


