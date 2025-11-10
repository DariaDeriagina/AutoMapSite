// firebase.js (ES module)

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

// TODO: вставь свой конфиг
const firebaseConfig = {
	apiKey: "YOUR_WEB_API_KEY",
	authDomain: "YOUR_PROJECT.firebaseapp.com",
	projectId: "YOUR_PROJECT_ID",
	storageBucket: "YOUR_PROJECT.appspot.com",
	messagingSenderId: "XXXX",
	appId: "1:XXXX:web:XXXX",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Экспортируем в window именно то, что использует logbook.js
window.firebaseApp = app;
window.firebaseDB = db;
window.firebaseAuth = auth;

// Собираем helper-объект fs, чтобы logbook.js мог вызывать как сейчас
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

// Стартуем анонимную авторизацию, чтобы onAuthStateChanged в logbook.js сработал
signInAnonymously(auth).catch((err) => {
	console.error("[firebase] anonymous sign-in failed:", err);
});

console.log("[firebase] init ok", { hasDB: !!window.firebaseDB });
