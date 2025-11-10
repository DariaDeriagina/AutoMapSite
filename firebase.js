import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
	getFirestore,
	collection,
	addDoc,
	getDocs,
	deleteDoc,
	doc,
	onSnapshot,
	query,
	orderBy,
	updateDoc,
	writeBatch,
	serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import {
	getAuth,
	signInAnonymously,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
	apiKey: "AIzaSyCzPTq388hwmATTMhEXjSR9naAnI2xRxQw",
	authDomain: "automap-logbook.firebaseapp.com",
	projectId: "automap-logbook",
	storageBucket: "automap-logbook.firebasestorage.app",
	messagingSenderId: "569545953515",
	appId: "1:569545953515:web:6f32e5e5e1385f27e6eeae",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// anonymous auth
signInAnonymously(auth).catch(console.error);

// expose for other scripts
window.firebaseDB = db;
window.firebaseAuth = auth;
window.fs = {
	collection,
	addDoc,
	getDocs,
	deleteDoc,
	doc,
	onSnapshot,
	query,
	orderBy,
	updateDoc,
	writeBatch,
	serverTimestamp,
	onAuthStateChanged,
};
