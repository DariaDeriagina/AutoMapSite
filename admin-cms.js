// admin-cms.js — AutoMap CMS editor (back-office)

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

		// 1) Загрузить текущие данные
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

		// 2) Сохранение
		form.addEventListener("submit", async (e) => {
			e.preventDefault();

			const payload = {};
			FIELDS.forEach((field) => {
				const el = document.getElementById("cms-" + field);
				if (!el) return;
				const value = el.value; // не обрезаем до пустой строки — пусть клиент сам решает
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
	}

	// Ждём Firebase
	if (window.firebaseDB && window.fs) {
		initAdminCMS();
	} else {
		window.addEventListener("firebase-ready", initAdminCMS, { once: true });
	}
})();
