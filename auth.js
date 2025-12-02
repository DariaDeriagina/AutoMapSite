// ===============================
// auth.js — Passcode gate (EN) with Firestore-based passcode
// ===============================

// 🔐 Значения по умолчанию (те, что были захардкожены раньше)
const DEFAULT_PASS_SALT = "amcs-logbook-v1";
const DEFAULT_PASS_HASH =
	"c8045312ba4e29913f25d4ed1bbc9a0a95815a7c0cd570e5ce775675bfef9a4c";

const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 2 * 60 * 1000;

const STORAGE = sessionStorage;
const STORAGE_KEY = "amcs_gate";

const gateEl = document.getElementById("gate");
const appEl = document.getElementById("app");

// 🔐 Текущее значение пароля (может перезаписаться данными из Firestore)
let CURRENT_PASS_SALT = DEFAULT_PASS_SALT;
let CURRENT_PASS_HASH = DEFAULT_PASS_HASH;

// Firestore-документ, где хранится пароль
const AUTH_SETTINGS_COLLECTION = "settings";
const AUTH_SETTINGS_DOC_ID = "authGate";

// ----------------- helpers -----------------
function timingSafeEqual(a, b) {
	if (a.length !== b.length) return false;
	let r = 0;
	for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return r === 0;
}

async function sha256Hex(str) {
	const buf = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(str)
	);
	return [...new Uint8Array(buf)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function getState() {
	try {
		return JSON.parse(STORAGE.getItem(STORAGE_KEY) || "{}");
	} catch {
		return {};
	}
}

function setState(o) {
	STORAGE.setItem(STORAGE_KEY, JSON.stringify(o || {}));
}

// ----------------- UI -----------------
function showApp() {
	appEl.hidden = false;
	gateEl.innerHTML = `
    <div class="text-end p-2">
      <button id="logoutBtn" class="btn btn-sm btn-outline-secondary">Logout</button>
    </div>
  `;
	document.getElementById("logoutBtn").onclick = () => {
		setState({});
		location.reload();
	};
}

function showForm(message = "") {
	gateEl.innerHTML = `
    <div class="container" style="max-width:420px;margin:12vh auto;">
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title mb-3">Enter passcode</h5>
          ${
						message
							? `<div class="alert alert-warning py-2">${message}</div>`
							: ""
					}
          <form id="passForm" autocomplete="off">
            <div class="input-group mb-3">
              <input type="password" class="form-control" id="passInput" placeholder="Passcode" required />
              <button class="btn btn-outline-secondary" type="button" id="togglePw" aria-label="Show/Hide password">👁</button>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-primary" type="submit">Unlock</button>
              <button class="btn btn-outline-secondary" type="button" id="resetBtn">Reset</button>
            </div>
          </form>
          <p class="text-muted small mt-3 mb-0">Protected area — AutoMap staff only</p>
        </div>
      </div>
    </div>`;

	const input = document.getElementById("passInput");
	input.focus();

	document.getElementById("togglePw").onclick = () => {
		input.type = input.type === "password" ? "text" : "password";
		input.focus();
	};

	document.getElementById("resetBtn").onclick = () => {
		setState({});
		showForm();
	};

	document.getElementById("passForm").onsubmit = onSubmit;
}

// ----------------- Firestore: загрузка пароля -----------------
async function loadPasscodeFromFirestore() {
	const db = window.firebaseDB;
	const fs = window.fs;

	if (!db || !fs || !fs.doc || !fs.getDoc || !fs.setDoc) {
		console.warn(
			"[auth] Firebase or fs.{doc,getDoc,setDoc} not ready, using default passcode"
		);
		return;
	}

	try {
		const docRef = fs.doc(db, AUTH_SETTINGS_COLLECTION, AUTH_SETTINGS_DOC_ID);
		const snap = await fs.getDoc(docRef);

		if (snap.exists()) {
			const data = snap.data() || {};
			if (data.passSalt && data.passHash) {
				CURRENT_PASS_SALT = data.passSalt;
				CURRENT_PASS_HASH = data.passHash;
				console.log("[auth] Loaded passcode from Firestore");
				return;
			}
		}

		// Если документа нет — создаём с дефолтными значениями
		await fs.setDoc(
			docRef,
			{
				passSalt: DEFAULT_PASS_SALT,
				passHash: DEFAULT_PASS_HASH,
				createdAt: fs.serverTimestamp ? fs.serverTimestamp() : null,
			},
			{ merge: true }
		);
		console.log("[auth] Created default authGate doc in Firestore");
	} catch (err) {
		console.error("[auth] Failed to load auth settings from Firestore:", err);
		// В этом случае просто продолжаем с дефолтным паролем
	}
}

// ----------------- submit -----------------
async function onSubmit(e) {
	e.preventDefault();
	const st = getState();
	const now = Date.now();

	if (st.lockedUntil && now < st.lockedUntil) {
		const secs = Math.ceil((st.lockedUntil - now) / 1000);
		showForm(`Too many attempts. Try again in ${secs}s.`);
		return;
	}

	const pass = document.getElementById("passInput").value.trim();
	const hash = await sha256Hex(`${CURRENT_PASS_SALT}:${pass}`);

	if (timingSafeEqual(hash, CURRENT_PASS_HASH)) {
		setState({ unlocked: true });
		showApp();
	} else {
		const next = { ...st, n: (st.n || 0) + 1 };
		if (next.n >= MAX_ATTEMPTS) {
			next.n = 0;
			next.lockedUntil = now + COOLDOWN_MS;
			setState(next);
			showForm("Too many attempts. Please wait 2 minutes.");
		} else {
			setState(next);
			showForm(`Wrong passcode. Attempts left: ${MAX_ATTEMPTS - next.n}`);
		}
	}
}

// ----------------- init -----------------
(function init() {
	// Функция, которую вызываем, когда Firebase готов (или если его нет)
	const start = async () => {
		// Пробуем подтянуть пароль из Firestore (если доступен)
		await loadPasscodeFromFirestore();

		const st = getState();
		if (st.unlocked) showApp();
		else showForm();
	};

	// Если firebase уже есть
	if (window.firebaseDB && window.fs) {
		start();
	} else {
		// Ждём событие от firebase.app.js
		window.addEventListener("firebase-ready", start, { once: true });
	}
})();
