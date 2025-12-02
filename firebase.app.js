// ==============================
// firebase.app.js — AutoMap shared Firebase
// ==============================

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
	getDoc,
	setDoc, // ✅ добавили
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
	getAuth,
	onAuthStateChanged,
	signInAnonymously,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// ==============================
// Firebase config
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
// Expose to window
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
	getDoc, // ✅ добавили
	setDoc, // ✅ добавили
};

// ==============================
// Sign in anonymously (required for Firestore)
// ==============================
signInAnonymously(auth)
	.then(() => {
		console.log("[firebase] anonymous sign-in ok");
		// После успешного логина говорим всем, что Firebase готов
		window.dispatchEvent(new Event("firebase-ready"));
	})
	.catch((err) => {
		console.error("[firebase] anonymous sign-in failed:", err);
		window.dispatchEvent(new Event("firebase-ready"));
	});

// ==============================
// Confirm init
// ==============================
console.log("[firebase] init ok", {
	hasDB: !!window.firebaseDB,
	hasAuth: !!window.firebaseAuth,
});
