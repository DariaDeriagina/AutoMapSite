// cms.js — apply CMS content to index.html

(function () {
	const FIELD_TO_ELEMENT = {
		heroTitle: "heroTitle",
		heroSubtitle: "heroSubtitle",
		heroPrimaryCta: "heroPrimaryCta",
		heroSecondaryCta: "heroSecondaryCta",
		heroSocialText: "heroSocialText",

		contactTopAddress: "contactTopAddress",
		contactPhone1: "contactPhone1",
		contactPhone2: "contactPhone2",

		aboutKicker: "aboutKicker",
		aboutTitle: "aboutTitle",
		ramiName: "ramiName",
		ramiRole: "ramiRole",
		ramiText: "ramiText",
		mohName: "mohName",
		mohRole: "mohRole",
		mohText: "mohText",

		servicesKicker: "servicesKicker",
		servicesTitle: "servicesTitle",
		service1Title: "service1Title",
		service1Desc: "service1Desc",
		service2Title: "service2Title",
		service2Desc: "service2Desc",
		service3Title: "service3Title",
		service3Desc: "service3Desc",
		service4Title: "service4Title",
		service4Desc: "service4Desc",
		service5Title: "service5Title",
		service5Desc: "service5Desc",
		service6Title: "service6Title",
		service6Desc: "service6Desc",
		service7Title: "service7Title",
		service7Desc: "service7Desc",
		service8Title: "service8Title",
		service8Desc: "service8Desc",
		service9Title: "service9Title",
		service9Desc: "service9Desc",

		testimonialsKicker: "testimonialsKicker",
		testimonialsTitle: "testimonialsTitle",

		videoIntro: "videoIntro",
		videoTitle: "videoTitle",

		contactKicker: "contactKicker",
		contactTitle: "contactTitle",
		contactCallLabel: "contactCallLabel",
		contactCallHours: "contactCallHours",
		contactCallNumber: "contactCallNumber",
		contactCallButton: "contactCallButton",
		contactAddressLabel: "contactAddressLabel",
		contactAddressHours: "contactAddressHours",
		contactAddressText: "contactAddressText",

		footerCopyright: "footerCopyright",
	};

	async function initCMS() {
		const db = window.firebaseDB;
		const fs = window.fs;

		if (!db || !fs) {
			console.error("[cms] Firebase not ready");
			return;
		}

		try {
			const docRef = fs.doc(db, "cms", "home");
			const snap = await fs.getDoc(docRef);

			if (!snap.exists()) {
				console.warn("[cms] cms/home doc does not exist yet");
				return;
			}

			const data = snap.data();

			for (const [field, elementId] of Object.entries(FIELD_TO_ELEMENT)) {
				if (!Object.prototype.hasOwnProperty.call(data, field)) continue;
				const el = document.getElementById(elementId);
				if (!el) continue;
				el.textContent = data[field];
			}
		} catch (err) {
			console.error("[cms] failed to load cms/home:", err);
		}
	}

	if (window.firebaseDB && window.fs) {
		initCMS();
	} else {
		window.addEventListener("firebase-ready", initCMS, { once: true });
	}
})();
