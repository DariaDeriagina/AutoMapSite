// script.js — UI + CMS rendering (Hero with highlighted words)

(function () {
	const NAV_OFFSET = 100; // высота навбара

	// =========================
	// Hero title formatter
	// =========================
	function renderHeroTitle(raw) {
		if (!raw) return "";

		// Сначала заменим перенос строки на <br>
		let html = raw.replace(/\r?\n/g, "<br />");

		// Подсветка ключевых слов
		html = html
			.replace(/EXPERTS/gi, '<span class="text-expert">EXPERTS</span>')
			.replace(/CAR/gi, '<span class="text-expert">CAR</span>');

		return html;
	}

	// =========================
	// Применение CMS-данных
	// =========================
	function applyCms(data) {
		if (!data) return;

		// Hero title
		const heroTitleEl = document.getElementById("heroTitle");
		if (heroTitleEl) {
			const fallback = heroTitleEl.textContent.trim();
			const raw = data.heroTitle || fallback;
			heroTitleEl.innerHTML = renderHeroTitle(raw);
		}

		// Hero subtitle
		const heroSubtitleEl = document.querySelector(".hero-subtext");
		if (heroSubtitleEl && data.heroSubtitle) {
			heroSubtitleEl.textContent = data.heroSubtitle;
		}

		// Hero buttons
		const primaryCtaEl = document.querySelector(".call-btn");
		if (primaryCtaEl && data.heroPrimaryCta) {
			primaryCtaEl.textContent = data.heroPrimaryCta;
		}

		const secondaryCtaEl = document.querySelector(".our-service-btn");
		if (secondaryCtaEl && data.heroSecondaryCta) {
			secondaryCtaEl.textContent = data.heroSecondaryCta;
		}

		// Hero social text
		const heroSocialTextEl = document.querySelector(".hero-social-text");
		if (heroSocialTextEl && data.heroSocialText) {
			heroSocialTextEl.textContent = data.heroSocialText;
		}

		// Top contact box
		const topAddressEl = document.querySelector(
			"[data-cms-key='contactTopAddress']"
		);
		if (topAddressEl && data.contactTopAddress) {
			topAddressEl.textContent = data.contactTopAddress;
		}

		const phoneEls = document.querySelectorAll(
			"[data-cms-key='contactPhone1'], [data-cms-key='contactPhone2']"
		);
		if (phoneEls[0] && data.contactPhone1) {
			phoneEls[0].textContent = data.contactPhone1;
		}
		if (phoneEls[1] && data.contactPhone2) {
			phoneEls[1].textContent = data.contactPhone2;
		}

		// About / Our Team
		const aboutKickerEl = document.querySelector(
			"[data-cms-key='aboutKicker']"
		);
		if (aboutKickerEl && data.aboutKicker) {
			aboutKickerEl.textContent = data.aboutKicker;
		}

		const aboutTitleEl = document.querySelector("[data-cms-key='aboutTitle']");
		if (aboutTitleEl && data.aboutTitle) {
			aboutTitleEl.textContent = data.aboutTitle;
		}

		const ramiNameEl = document.querySelector("[data-cms-key='ramiName']");
		if (ramiNameEl && data.ramiName) {
			ramiNameEl.textContent = data.ramiName;
		}

		const ramiRoleEl = document.querySelector("[data-cms-key='ramiRole']");
		if (ramiRoleEl && data.ramiRole) {
			ramiRoleEl.textContent = data.ramiRole;
		}

		const ramiTextEl = document.querySelector("[data-cms-key='ramiText']");
		if (ramiTextEl && data.ramiText) {
			ramiTextEl.textContent = data.ramiText;
		}

		const mohNameEl = document.querySelector("[data-cms-key='mohName']");
		if (mohNameEl && data.mohName) {
			mohNameEl.textContent = data.mohName;
		}

		const mohRoleEl = document.querySelector("[data-cms-key='mohRole']");
		if (mohRoleEl && data.mohRole) {
			mohRoleEl.textContent = data.mohRole;
		}

		const mohTextEl = document.querySelector("[data-cms-key='mohText']");
		if (mohTextEl && data.mohText) {
			mohTextEl.textContent = data.mohText;
		}

		// Services
		const servicesKickerEl = document.querySelector(
			"[data-cms-key='servicesKicker']"
		);
		if (servicesKickerEl && data.servicesKicker) {
			servicesKickerEl.textContent = data.servicesKicker;
		}

		const servicesTitleEl = document.querySelector(
			"[data-cms-key='servicesTitle']"
		);
		if (servicesTitleEl && data.servicesTitle) {
			servicesTitleEl.textContent = data.servicesTitle;
		}

		for (let i = 1; i <= 9; i++) {
			const titleKey = `service${i}Title`;
			const descKey = `service${i}Desc`;

			const titleEl = document.querySelector(`[data-cms-key='${titleKey}']`);
			if (titleEl && data[titleKey]) {
				titleEl.textContent = data[titleKey];
			}

			const descEl = document.querySelector(`[data-cms-key='${descKey}']`);
			if (descEl && data[descKey]) {
				descEl.textContent = data[descKey];
			}
		}

		// Testimonials / video text
		const testimonialsKickerEl = document.querySelector(
			"[data-cms-key='testimonialsKicker']"
		);
		if (testimonialsKickerEl && data.testimonialsKicker) {
			testimonialsKickerEl.textContent = data.testimonialsKicker;
		}

		const testimonialsTitleEl = document.querySelector(
			"[data-cms-key='testimonialsTitle']"
		);
		if (testimonialsTitleEl && data.testimonialsTitle) {
			testimonialsTitleEl.textContent = data.testimonialsTitle;
		}

		const videoIntroEl = document.querySelector("[data-cms-key='videoIntro']");
		if (videoIntroEl && data.videoIntro) {
			videoIntroEl.textContent = data.videoIntro;
		}

		const videoTitleEl = document.querySelector("[data-cms-key='videoTitle']");
		if (videoTitleEl && data.videoTitle) {
			videoTitleEl.textContent = data.videoTitle;
		}

		// Contact section
		const contactKickerEl = document.querySelector(
			"[data-cms-key='contactKicker']"
		);
		if (contactKickerEl && data.contactKicker) {
			contactKickerEl.textContent = data.contactKicker;
		}

		const contactTitleEl = document.querySelector(
			"[data-cms-key='contactTitle']"
		);
		if (contactTitleEl && data.contactTitle) {
			contactTitleEl.textContent = data.contactTitle;
		}

		const contactCallLabelEl = document.querySelector(
			"[data-cms-key='contactCallLabel']"
		);
		if (contactCallLabelEl && data.contactCallLabel) {
			contactCallLabelEl.textContent = data.contactCallLabel;
		}

		const contactCallHoursEl = document.querySelector(
			"[data-cms-key='contactCallHours']"
		);
		if (contactCallHoursEl && data.contactCallHours) {
			contactCallHoursEl.textContent = data.contactCallHours;
		}

		const contactCallNumberEl = document.querySelector(
			"[data-cms-key='contactCallNumber']"
		);
		if (contactCallNumberEl && data.contactCallNumber) {
			contactCallNumberEl.textContent = data.contactCallNumber;
		}

		const contactCallButtonEl = document.querySelector(
			"[data-cms-key='contactCallButton']"
		);
		if (contactCallButtonEl && data.contactCallButton) {
			contactCallButtonEl.textContent = data.contactCallButton;
		}

		const contactAddressLabelEl = document.querySelector(
			"[data-cms-key='contactAddressLabel']"
		);
		if (contactAddressLabelEl && data.contactAddressLabel) {
			contactAddressLabelEl.textContent = data.contactAddressLabel;
		}

		const contactAddressHoursEl = document.querySelector(
			"[data-cms-key='contactAddressHours']"
		);
		if (contactAddressHoursEl && data.contactAddressHours) {
			contactAddressHoursEl.textContent = data.contactAddressHours;
		}

		const contactAddressTextEl = document.querySelector(
			"[data-cms-key='contactAddressText']"
		);
		if (contactAddressTextEl && data.contactAddressText) {
			contactAddressTextEl.textContent = data.contactAddressText;
		}

		// Footer
		const footerCopyEl = document.querySelector(
			"[data-cms-key='footerCopyright']"
		);
		if (footerCopyEl && data.footerCopyright) {
			footerCopyEl.textContent = data.footerCopyright;
		}
	}

	// =========================
	// Загрузка CMS из Firestore
	// =========================
	async function loadCmsAndApply() {
		const db = window.firebaseDB;
		const fs = window.fs;
		if (!db || !fs) {
			console.warn("[cms] Firebase not ready on public site");
			return;
		}

		try {
			const docRef = fs.doc(db, "cms", "home");
			const snap = await fs.getDoc(docRef);
			if (!snap.exists()) {
				console.warn("[cms] cms/home does not exist, using default HTML");
				return;
			}
			const data = snap.data() || {};
			applyCms(data);
		} catch (err) {
			console.error("[cms] failed to load cms/home:", err);
		}
	}

	// =========================
	// UI (scroll, active nav, animations, reviews)
	// =========================
	function initUI() {
		const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
		const sections = document.querySelectorAll("section[id]");

		// Smooth scroll with offset
		navLinks.forEach((link) => {
			link.addEventListener("click", (e) => {
				const targetId = link.getAttribute("href");
				if (!targetId || !targetId.startsWith("#")) return;

				const targetEl = document.querySelector(targetId);
				if (!targetEl) return;

				e.preventDefault();

				const top =
					targetEl.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;

				window.scrollTo({ top, behavior: "smooth" });

				// close Bootstrap nav on mobile
				const nav = document.getElementById("navbarNav");
				if (nav && typeof bootstrap !== "undefined") {
					const bs = bootstrap.Collapse.getOrCreateInstance(nav, {
						toggle: false,
					});
					bs.hide();
				}
			});
		});

		// Active nav highlight
		const setActive = () => {
			const scrollPos = window.scrollY + NAV_OFFSET + 1;
			sections.forEach((section) => {
				const top = section.offsetTop;
				const height = section.offsetHeight;
				const id = section.id;
				const isIn = scrollPos >= top && scrollPos < top + height;

				navLinks.forEach((link) => {
					if (link.getAttribute("href") === `#${id}`) {
						link.classList.toggle("active", isIn);
					}
				});
			});
		};

		let ticking = false;
		window.addEventListener(
			"scroll",
			() => {
				if (!ticking) {
					window.requestAnimationFrame(() => {
						setActive();
						ticking = false;
					});
					ticking = true;
				}
			},
			{ passive: true }
		);

		setActive();

		// Animate-on-scroll
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) entry.target.classList.add("show");
				});
			},
			{ threshold: 0.1 }
		);

		document
			.querySelectorAll(".animate-on-scroll")
			.forEach((el) => observer.observe(el));

		// Testimonials: duplicate track once for infinite loop
		const track = document.querySelector(".reviews-track");
		if (track && !track.dataset.duplicated) {
			track.innerHTML += track.innerHTML;
			track.dataset.duplicated = "true";
		}

		// Respect prefers-reduced-motion
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			document.documentElement.style.setProperty("--reviews-anim", "paused");
		}
	}

	// =========================
	// Старт
	// =========================
	function start() {
		initUI();

		// Ждём Firebase, чтобы подтянуть CMS
		if (window.firebaseDB && window.fs) {
			loadCmsAndApply();
		} else {
			window.addEventListener("firebase-ready", loadCmsAndApply, {
				once: true,
			});
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", start);
	} else {
		start();
	}
})();
document.addEventListener("DOMContentLoaded", () => {
	function highlightHeroTitle() {
		const el = document.getElementById("heroTitle");
		if (!el) return;

		// Берём только текст (без старых span-ов)
		const raw = el.textContent.trim();
		if (!raw) return;

		let html = raw.replace(/\r?\n/g, "<br />");

		html = html
			.replace(/EXPERTS/gi, '<span class="text-expert">$&</span>')
			.replace(/CAR/gi, '<span class="text-expert">$&</span>');

		el.innerHTML = html;
	}

	// 1) сразу после загрузки
	highlightHeroTitle();

	// 2) ещё раз чуть позже — вдруг CMS успел перезаписать текст после Firebase
	setTimeout(highlightHeroTitle, 800);
});
