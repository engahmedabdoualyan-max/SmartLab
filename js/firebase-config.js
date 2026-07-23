// ================================================================
// FIREBASE
// ================================================================
// Initialize Firebase from centralized config
var FIREBASE_CONFIG = (typeof SmartLab_CONFIG !== 'undefined') 
    ? SmartLab_CONFIG.firebase 
    : {apiKey:"AIzaSyDDr7EQ95hLdecc1BDIZIFhmmmVMLArBsU",authDomain:"smartlab-5e4e7.firebaseapp.com",projectId:"smartlab-5e4e7",storageBucket:"smartlab-5e4e7.firebasestorage.app",messagingSenderId:"1051839900093",appId:"1:1051839900093:web:fde212b37711cd6ff70ad4"};

firebase.initializeApp(FIREBASE_CONFIG);
var db = firebase.firestore();
var auth = firebase.auth();
var currentUser = null;
