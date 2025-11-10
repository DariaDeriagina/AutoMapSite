// ==============================
// firebase.app.js — AutoMap Logbook
// ==============================

// Import core + Firestore + Auth from Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
	getFirestore,
	collection,
	doc,
	addDoc,
	updateDoc,
	deleteDoc,
	writeBatch,
	serverTimestamp,
	query,
	orderBy,
	onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
	getAuth,
	onAuthStateChanged,
	signInAnonymously,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// ==============================
// Your real Firebase config
// ==============================
const firebaseConfig = {
	apiKey: "AIzaSyCzPTq388hwmATTMhEXjSR9naAnI2xRxQw",
	authDomain: "automap-logbook.firebaseapp.com",
	projectId: "automap-logbook",
	storageBucket: "automap-logbook.firebasestorage.app",
	messagingSenderId: "569545953515",
	appId: "1:569545953515:web:6f32e5e5e1385f27e6eeae",
};

// ==============================
// Initialize Firebase
// ==============================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==============================
// Expose to window (used by logbook.js)
// ==============================
window.firebaseApp = app;
window.firebaseDB = db;
window.firebaseAuth = auth;

window.fs = {
	collection,
	doc,
	addDoc,
	updateDoc,
	deleteDoc,
	writeBatch,
	serverTimestamp,
	query,
	orderBy,
	onSnapshot,
	onAuthStateChanged,
};

// ==============================
// Sign in anonymously (required for Firestore)
// ==============================
signInAnonymously(auth)
	.then(() => {
		console.log("[firebase] anonymous sign-in ok");
	})
	.catch((err) => {
		console.error("[firebase] anonymous sign-in failed:", err);
	});

// ==============================
// Confirm init + trigger event
// ==============================
console.log("[firebase] init ok", {
	hasDB: !!window.firebaseDB,
	hasAuth: !!window.firebaseAuth,
});

// Notify other scripts (logbook.js) that Firebase is ready
window.dispatchEvent(new Event("firebase-ready"));
