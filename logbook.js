// logbook.js — AutoMap Logbook UI

(function () {
	function initLogbook() {
		const db = window.firebaseDB;
		const fs = window.fs;

		if (!db || !fs) {
			console.error("Firebase not ready on window");
			return;
		}

		console.log("[logbook] Firebase ready", db);

		const form = document.getElementById("logForm");
		const priceInput = document.getElementById("price");
		const serviceSelect = document.getElementById("serviceSelect");
		const serviceInput = document.getElementById("service");
		const tableBody = document.getElementById("logTable");

		const totalDayEl = document.getElementById("totalDay");
		const totalWeekEl = document.getElementById("totalWeek");
		const totalMonthEl = document.getElementById("totalMonth");

		const entriesCol = fs.collection(db, "entries");

		// Add entry
		form.addEventListener("submit", async (e) => {
			e.preventDefault();

			const service =
				serviceInput.value.trim() || serviceSelect.value.trim() || "";
			const price = Number(priceInput.value);

			if (!service || !price) {
				console.warn("Service or price missing");
				return;
			}

			await fs.addDoc(entriesCol, {
				service,
				price,
				createdAt: fs.serverTimestamp(),
			});

			serviceInput.value = "";
			priceInput.value = "";
			serviceSelect.value = "";
		});

		// Clear form
		document.getElementById("clearForm").addEventListener("click", () => {
			serviceInput.value = "";
			priceInput.value = "";
			serviceSelect.value = "";
		});

		// Listen for entries
		const q = fs.query(entriesCol, fs.orderBy("createdAt", "desc"));
		fs.onSnapshot(q, (snapshot) => {
			tableBody.innerHTML = "";

			const now = new Date();
			const startOfDay = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate()
			);
			const startOfWeek = new Date(startOfDay);
			startOfWeek.setDate(startOfWeek.getDate() - startOfDay.getDay()); // Sunday
			const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

			let sumDay = 0;
			let sumWeek = 0;
			let sumMonth = 0;

			snapshot.forEach((docSnap) => {
				const data = docSnap.data();
				const tr = document.createElement("tr");

				let dateStr = "";
				let createdAt = null;
				if (data.createdAt?.toDate) {
					createdAt = data.createdAt.toDate();
					dateStr = createdAt.toLocaleDateString();
				}

				const price = data.price || 0;

				if (createdAt) {
					if (createdAt >= startOfDay) sumDay += price;
					if (createdAt >= startOfWeek) sumWeek += price;
					if (createdAt >= startOfMonth) sumMonth += price;
				}

				tr.innerHTML = `
					<td>${dateStr}</td>
					<td>${data.service || ""}</td>
					<td>$${price}</td>
					<td>
						<button class="btn btn-sm btn-danger" data-id="${docSnap.id}">
							Delete
						</button>
					</td>
				`;

				tableBody.appendChild(tr);
			});

			totalDayEl.textContent = `Today: $${sumDay}`;
			totalWeekEl.textContent = `This Week: $${sumWeek}`;
			totalMonthEl.textContent = `This Month: $${sumMonth}`;
		});

		// Delete
		tableBody.addEventListener("click", async (e) => {
			const btn = e.target.closest("button[data-id]");
			if (!btn) return;
			const id = btn.getAttribute("data-id");
			await fs.deleteDoc(fs.doc(db, "entries", id));
		});

		// Stubs (чтобы кнопки не ломали js)
		window.clearPeriod = function (period) {
			console.log("clearPeriod stub:", period);
		};

		window.exportCSV = function () {
			console.log("exportCSV stub");
		};
	}

	if (window.firebaseDB && window.fs) {
		initLogbook();
	} else {
		window.addEventListener("firebase-ready", initLogbook, { once: true });
	}
})();
