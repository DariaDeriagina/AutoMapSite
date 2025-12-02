// admin-cms.js — AutoMap CMS editor + passcode changer

(function () {
	// Поля в Firestore и соответствующие поля формы (id: cms-...)
	const FIELDS = [
		"heroTitle",
		"heroSubtitle",
		"heroPrimaryCta",
		"heroSecondaryCta",
		"heroSocialText",

		"contactTopAddress",
		"contactPhone1",
		"contactPhone2",

		"aboutKicker",
		"aboutTitle",
		"ramiName",
		"ramiRole",
		"ramiText",
		"mohName",
		"mohRole",
		"mohText",

		"servicesKicker",
		"servicesTitle",
		"service1Title",
		"service1Desc",
		"service2Title",
		"service2Desc",
		"service3Title",
		"service3Desc",
		"service4Title",
		"service4Desc",
		"service5Title",
		"service5Desc",
		"service6Title",
		"service6Desc",
		"service7Title",
		"service7Desc",
		"service8Title",
		"service8Desc",
		"service9Title",
		"service9Desc",

		"testimonialsKicker",
		"testimonialsTitle",

		"videoIntro",
		"videoTitle",

		"contactKicker",
		"contactTitle",
		"contactCallLabel",
		"contactCallHours",
		"contactCallNumber",
		"contactCallButton",
		"contactAddressLabel",
		"contactAddressHours",
		"contactAddressText",

		"footerCopyright",
	];

	// Те же дефолты, что в auth.js
	const DEFAULT_PASS_SALT = "amcs-logbook-v1";
	const DEFAULT_PASS_HASH =
		"c8045312ba4e29913f25d4ed1bbc9a0a95815a7c0cd570e5ce775675bfef9a4c";

	const AUTH_SETTINGS_COLLECTION = "settings";
	const AUTH_SETTINGS_DOC_ID = "authGate";

	async function sha256Hex(str) {
		const buf = await crypto.subtle.digest(
			"SHA-256",
			new TextEncoder().encode(str)
		);
		return [...new Uint8Array(buf)]
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
	}

	async function initAdminCMS() {
		const db = window.firebaseDB;
		const fs = window.fs;

		if (!db || !fs) {
			console.error("[admin-cms] Firebase not ready");
			return;
		}

		const form = document.getElementById("cmsForm");
		if (!form) {
			console.error("[admin-cms] cmsForm not found");
			return;
		}

		const docRef = fs.doc(db, "cms", "home");

		// 1) Загрузить текущие данные CMS
		try {
			const snap = await fs.getDoc(docRef);
			if (snap.exists()) {
				const data = snap.data() || {};
				FIELDS.forEach((field) => {
					const el = document.getElementById("cms-" + field);
					if (!el) return;
					if (Object.prototype.hasOwnProperty.call(data, field)) {
						el.value = data[field];
					}
				});
			} else {
				console.warn(
					"[admin-cms] cms/home does not exist yet; will be created on first save"
				);
			}
		} catch (err) {
			console.error("[admin-cms] failed to load cms/home:", err);
		}

		// 2) Сохранение контента
		form.addEventListener("submit", async (e) => {
			e.preventDefault();

			const payload = {};
			FIELDS.forEach((field) => {
				const el = document.getElementById("cms-" + field);
				if (!el) return;
				const value = el.value;
				payload[field] = value;
			});

			try {
				await fs.setDoc(docRef, payload, { merge: true });
				alert("Content saved successfully!");
			} catch (err) {
				console.error("[admin-cms] failed to save cms/home:", err);
				alert("Error saving content. Please check console.");
			}
		});

		// 3) Инициализация формы смены пароля
		initChangePassForm(db, fs);
	}

	async function initChangePassForm(db, fs) {
		const changeForm = document.getElementById("changePassForm");
		const msgEl = document.getElementById("cp-message");

		if (!changeForm || !msgEl) {
			return;
		}

		const settingsRef = fs.doc(
			db,
			AUTH_SETTINGS_COLLECTION,
			AUTH_SETTINGS_DOC_ID
		);

		// Подтянуть текущие настройки (или создать дефолт)
		let currentSalt = DEFAULT_PASS_SALT;
		let currentHash = DEFAULT_PASS_HASH;

		try {
			const snap = await fs.getDoc(settingsRef);
			if (snap.exists()) {
				const d = snap.data() || {};
				if (d.passSalt && d.passHash) {
					currentSalt = d.passSalt;
					currentHash = d.passHash;
				}
			} else {
				// Создаём дефолт, если ничего нет
				await fs.setDoc(
					settingsRef,
					{
						passSalt: DEFAULT_PASS_SALT,
						passHash: DEFAULT_PASS_HASH,
						createdAt: fs.serverTimestamp ? fs.serverTimestamp() : null,
					},
					{ merge: true }
				);
			}
		} catch (err) {
			console.error("[admin-cms] failed to load authGate settings:", err);
			// продолжаем с дефолтом
		}

		function showMessage(text, type) {
			msgEl.textContent = text;
			msgEl.className =
				"small mt-2 " +
				(type === "error"
					? "text-danger"
					: type === "success"
					? "text-success"
					: "text-muted");
		}

		changeForm.addEventListener("submit", async (e) => {
			e.preventDefault();

			const currentInput = document.getElementById("cp-current").value.trim();
			const newPass = document.getElementById("cp-new").value.trim();
			const confirmPass = document.getElementById("cp-confirm").value.trim();

			if (!currentInput || !newPass || !confirmPass) {
				showMessage("Please fill in all fields.", "error");
				return;
			}

			if (newPass.length < 4) {
				showMessage("New passcode should be at least 4 characters.", "error");
				return;
			}

			if (newPass !== confirmPass) {
				showMessage("New passcode and confirmation do not match.", "error");
				return;
			}

			try {
				// Проверяем старый пароль
				const currentInputHash = await sha256Hex(
					`${currentSalt}:${currentInput}`
				);
				if (currentInputHash !== currentHash) {
					showMessage("Current passcode is incorrect.", "error");
					return;
				}

				// Генерируем новый соль и хэш
				const saltRandom = crypto
					.getRandomValues(new Uint32Array(1))[0]
					.toString(16)
					.padStart(8, "0");
				const newSalt = `amcs-${saltRandom}`;
				const newHash = await sha256Hex(`${newSalt}:${newPass}`);

				await fs.setDoc(
					settingsRef,
					{
						passSalt: newSalt,
						passHash: newHash,
						updatedAt: fs.serverTimestamp ? fs.serverTimestamp() : null,
					},
					{ merge: true }
				);

				// Обновляем локальные значения, чтобы можно было менять ещё раз без перезагрузки
				currentSalt = newSalt;
				currentHash = newHash;

				changeForm.reset();
				showMessage(
					"Passcode updated successfully. It will be used on the next login.",
					"success"
				);
			} catch (err) {
				console.error("[admin-cms] failed to change passcode:", err);
				showMessage("Error updating passcode. Please try again.", "error");
			}
		});
	}

	// Ждём Firebase
	if (window.firebaseDB && window.fs) {
		initAdminCMS();
	} else {
		window.addEventListener("firebase-ready", initAdminCMS, { once: true });
	}
})();
