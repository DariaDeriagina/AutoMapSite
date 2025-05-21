const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section[id]");

// Smooth scroll + highlight
navLinks.forEach((link) => {
	link.addEventListener("click", function (e) {
		const targetId = this.getAttribute("href");
		if (targetId.startsWith("#")) {
			e.preventDefault();
			document.querySelector(targetId).scrollIntoView({ behavior: "smooth" });
		}
	});
});

window.addEventListener("scroll", () => {
	const scrollPos = window.scrollY + 120;

	sections.forEach((section) => {
		const top = section.offsetTop;
		const height = section.offsetHeight;
		const id = section.getAttribute("id");

		if (scrollPos >= top && scrollPos < top + height) {
			navLinks.forEach((link) => {
				link.classList.remove("active");
				if (link.getAttribute("href") === `#${id}`) {
					link.classList.add("active");
				}
			});
		}
	});
});

// Scroll Animation Script

const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("show");
			}
		});
	},
	{
		threshold: 0.1,
	}
);

document
	.querySelectorAll(".animate-on-scroll")
	.forEach((el) => observer.observe(el));
