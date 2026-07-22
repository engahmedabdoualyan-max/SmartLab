import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDDr7EQ95hLdecc1BDIZIFhmmmVMLArBsU",
    authDomain: "smartlab-5e4e7.firebaseapp.com",
    projectId: "smartlab-5e4e7",
    storageBucket: "smartlab-5e4e7.firebasestorage.app",
    messagingSenderId: "1051839900093",
    appId: "1:1051839900093:web:fde212b37711cd6ff70ad4",
    measurementId: "G-CQFWXWMTQM"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db, collection, addDoc, getDocs, query, orderBy, doc, getDoc };
