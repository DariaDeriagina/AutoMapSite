// admin-cms.js — AutoMap CMS editor (content + passcode change)

(function () {
	// Поля в Firestore и соответствующие поля формы (id="cms-...")
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

	// Оригинальные данные cms/home, загруженные при открытии
	let originalData = {};

	// =====================================================
	// Инициализация CMS (контент сайта)
	// =====================================================
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

		// 1) Загрузить текущие данные cms/home
		try {
			const snap = await fs.getDoc(docRef);
			if (snap.exists()) {
				const data = snap.data() || {};
				originalData = data;

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
				originalData = {};
			}
		} catch (err) {
			console.error("[admin-cms] failed to load cms/home:", err);
			originalData = {};
		}

		// 2) Сохранение контента
		form.addEventListener("submit", async (e) => {
			e.preventDefault();

			const payload = {};

			FIELDS.forEach((field) => {
				const el = document.getElementById("cms-" + field);
				if (!el) return;

				const value = el.value;
				const hasOriginal = Object.prototype.hasOwnProperty.call(
					originalData,
					field
				);

				if (value.trim() === "") {
					// Пустое поле:
					// если раньше было значение — оставляем старое
					if (hasOriginal) {
						payload[field] = originalData[field];
					}
					// если поля не было — не пишем его в payload (используется дефолт из HTML)
				} else {
					// Есть текст — сохраняем
					payload[field] = value;
				}
			});

			try {
				await fs.setDoc(docRef, payload, { merge: true });
				// Обновляем оригинал
				originalData = { ...originalData, ...payload };
				alert("Content saved successfully!");
			} catch (err) {
				console.error("[admin-cms] failed to save cms/home:", err);
				alert("Error saving content. Please check console.");
			}
		});

		// 3) Инициализируем блок смены пароля
		initChangePassForm(db, fs);
	}

	// =====================================================
	// Смена passcode (тот же, что используется в auth.js)
	// =====================================================
	function initChangePassForm(db, fs) {
		const form = document.getElementById("changePassForm");
		if (!form) return;

		const msgEl = document.getElementById("cp-message");
		const currentEl = document.getElementById("cp-current");
		const newEl = document.getElementById("cp-new");
		const confirmEl = document.getElementById("cp-confirm");

		// Тот же документ, который читает auth.js: /authGate/gate
		const gateDocRef = fs.doc(db, "authGate", "gate");

		function setMsg(text, type = "info") {
			if (!msgEl) return;
			const cls =
				type === "error"
					? "text-danger"
					: type === "success"
					? "text-success"
					: "text-muted";
			msgEl.className = "small mt-2 " + cls;
			msgEl.textContent = text;
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

		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			setMsg("");

			const current = currentEl.value.trim();
			const next = newEl.value.trim();
			const confirm = confirmEl.value.trim();

			if (!current || !next || !confirm) {
				setMsg("Please fill in all fields.", "error");
				return;
			}

			if (next !== confirm) {
				setMsg("New passcodes do not match.", "error");
				return;
			}

			try {
				// Читаем текущие настройки
				const snap = await fs.getDoc(gateDocRef);
				if (!snap.exists()) {
					setMsg(
						"Passcode config not found. Ask developer to set it up.",
						"error"
					);
					return;
				}

				const data = snap.data() || {};
				const salt = data.salt;
				const hash = data.passHash; // то же поле, что использует auth.js

				if (!salt || !hash) {
					setMsg("Passcode config is invalid. Ask developer to fix.", "error");
					return;
				}

				// Проверяем текущий пароль
				const currentHash = await sha256Hex(`${salt}:${current}`);
				if (currentHash !== hash) {
					setMsg("Current passcode is incorrect.", "error");
					return;
				}

				// Генерируем новый salt и hash
				const newSalt = crypto
					.getRandomValues(new Uint8Array(16))
					.reduce((acc, b) => acc + b.toString(16).padStart(2, "0"), "");

				const newHash = await sha256Hex(`${newSalt}:${next}`);

				await fs.setDoc(
					gateDocRef,
					{
						salt: newSalt,
						passHash: newHash,
						updatedAt: new Date().toISOString(),
					},
					{ merge: true }
				);

				// Чистим поля формы
				currentEl.value = "";
				newEl.value = "";
				confirmEl.value = "";

				setMsg("Passcode updated successfully.", "success");
			} catch (err) {
				console.error("[admin-cms] failed to change passcode:", err);
				setMsg("Error updating passcode. Please try again.", "error");
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
