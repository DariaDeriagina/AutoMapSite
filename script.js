// Highlight clicked navbar link
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach((link) => {
	link.addEventListener("click", function () {
		navLinks.forEach((l) => l.classList.remove("active"));
		this.classList.add("active");
	});
});

// Smooth scroll behavior fallback
navLinks.forEach((link) => {
	link.addEventListener("click", function (e) {
		const targetId = this.getAttribute("href");
		if (targetId.startsWith("#")) {
			e.preventDefault();
			document.querySelector(targetId).scrollIntoView({ behavior: "smooth" });
		}
	});
});
