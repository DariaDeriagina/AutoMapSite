document.addEventListener("DOMContentLoaded", () => {
	const NAV_OFFSET = 100; // height of your sticky nav (tweak if needed)

	const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
	const sections = document.querySelectorAll("section[id]");

	// Smooth scroll with offset (respects sticky navbar)
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

			// If using Bootstrap collapse on mobile, close the menu after click
			const nav = document.getElementById("navbarNav");
			if (nav && typeof bootstrap !== "undefined") {
				const bs = bootstrap.Collapse.getOrCreateInstance(nav, {
					toggle: false,
				});
				bs.hide();
			}
		});
	});

	// Active link highlight on scroll (throttled)
	const setActive = () => {
		const scrollPos = window.scrollY + NAV_OFFSET + 1; // +1 to favor current section
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

	// Initial highlight (e.g., on reload at mid-page)
	setActive();

	// Animate-on-scroll (your existing logic)
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

	// Testimonials: duplicate once for seamless loop (no manual duplication)
	const track = document.querySelector(".reviews-track");
	if (track && !track.dataset.duplicated) {
		track.innerHTML += track.innerHTML;
		track.dataset.duplicated = "true";
	}

	// Optional: respect users who prefer reduced motion
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		document.documentElement.style.setProperty("--reviews-anim", "paused");
	}
});

function renderHeroTitle(raw) {
	if (!raw) return "";

	return raw
		.replace(/EXPERTS/gi, `<span class="text-expert">EXPERTS</span>`)
		.replace(/CAR/gi, `<span class="text-expert">CAR</span>`);
}

const heroTitleEl = document.getElementById("heroTitle");
heroTitleEl.innerHTML = renderHeroTitle(data.heroTitle || "");
