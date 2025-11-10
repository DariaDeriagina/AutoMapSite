// ===== CONFIG =====
const PASS_SALT = "amcs-logbook-v1"; // change to any random string
const PASS_HASH =
	"c8045312ba4e29913f25d4ed1bbc9a0a95815a7c0cd570e5ce775675bfef9a4c"; // set in step 3
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

// ===== DOM =====
const gateEl = document.getElementById("gate");
const appEl = document.getElementById("app");

// ===== Helpers =====
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
		return JSON.parse(sessionStorage.getItem("amcs_gate") || "{}");
	} catch {
		return {};
	}
}
function setState(s) {
	sessionStorage.setItem("amcs_gate", JSON.stringify(s));
}

function showApp() {
	appEl.hidden = false;
	gateEl.innerHTML = `
    <div class="text-end p-2">
      <button id="logoutBtn" class="btn btn-sm btn-outline-secondary">Logout</button>
    </div>`;
	document.getElementById("logoutBtn").onclick = () => {
		setState({});
		location.reload();
	};
}

function showForm(msg = "") {
	gateEl.innerHTML = `
    <div class="container" style="max-width:420px;margin:12vh auto;">
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title mb-3">Enter passcode</h5>
          ${msg ? `<div class="alert alert-warning py-2">${msg}</div>` : ""}
          <form id="passForm" autocomplete="off">
            <input type="password" class="form-control mb-3" id="passInput" placeholder="Passcode" required />
            <div class="d-flex gap-2">
              <button class="btn btn-primary" type="submit">Unlock</button>
              <button class="btn btn-outline-secondary" type="button" id="resetBtn">Reset</button>
            </div>
          </form>
          <p class="text-muted small mt-3 mb-0">Protected area — AutoMap staff only</p>
        </div>
      </div>
    </div>`;
	document.getElementById("resetBtn").onclick = () => {
		setState({});
		showForm();
	};
	document.getElementById("passForm").onsubmit = async (e) => {
		e.preventDefault();
		const st = getState();
		const now = Date.now();
		if (st.lockedUntil && now < st.lockedUntil) {
			const secs = Math.ceil((st.lockedUntil - now) / 1000);
			showForm(`Too many attempts. Try again in ${secs}s.`);
			return;
		}
		const pass = document.getElementById("passInput").value;
		const hash = await sha256Hex(PASS_SALT + ":" + pass);
		if (timingSafeEqual(hash, PASS_HASH)) {
			setState({ unlocked: true });
			showApp();
		} else {
			const n = (st.n || 0) + 1;
			if (n >= MAX_ATTEMPTS) setState({ n: 0, lockedUntil: now + COOLDOWN_MS });
			else setState({ n });
			showForm(
				n >= MAX_ATTEMPTS
					? "Too many attempts. Please wait 2 minutes."
					: `Wrong passcode. Attempts left: ${MAX_ATTEMPTS - n}`
			);
		}
	};
}

// ===== Init =====
(function () {
	const st = getState();
	if (st.unlocked) showApp();
	else showForm();
})();
