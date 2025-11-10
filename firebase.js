// Подключаем Firebase SDK напрямую из CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
	getFirestore,
	collection,
	addDoc,
	getDocs,
	deleteDoc,
	doc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Твоя конфигурация
const firebaseConfig = {
	apiKey: "AIzaSyCzPTq388hwmATTMhEXjSR9naAnI2xRxQw",
	authDomain: "automap-logbook.firebaseapp.com",
	projectId: "automap-logbook",
	storageBucket: "automap-logbook.firebasestorage.app",
	messagingSenderId: "569545953515",
	appId: "1:569545953515:web:6f32e5e5e1385f27e6eeae",
};

// Инициализация Firebase и Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Делаем доступным для других скриптов
window.db = db;
window.collection = collection;
window.addDoc = addDoc;
window.getDocs = getDocs;
window.deleteDoc = deleteDoc;
window.doc = doc;
