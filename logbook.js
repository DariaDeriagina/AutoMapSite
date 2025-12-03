// logbook.js — AutoMap Logbook UI (with clearPeriod + exportCSV)

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

		// будем хранить текущие записи (для exportCSV)
		let currentEntries = [];

		// ---------- Add entry ----------
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

		// ---------- Clear form ----------
		document.getElementById("clearForm").addEventListener("click", () => {
			serviceInput.value = "";
			priceInput.value = "";
			serviceSelect.value = "";
		});

		// ---------- Listen for entries ----------
		const q = fs.query(entriesCol, fs.orderBy("createdAt", "desc"));
		fs.onSnapshot(q, (snapshot) => {
			tableBody.innerHTML = "";
			currentEntries = [];

			const now = new Date();
			const startOfDay = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate()
			);
			const startOfWeek = new Date(startOfDay);
			// Неделя с воскресенья (как в исходном коде)
			startOfWeek.setDate(startOfWeek.getDate() - startOfDay.getDay());
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
				const service = data.service || "";

				// копим для exportCSV
				currentEntries.push({
					id: docSnap.id,
					service,
					price,
					createdAt,
				});

				if (createdAt) {
					if (createdAt >= startOfDay) sumDay += price;
					if (createdAt >= startOfWeek) sumWeek += price;
					if (createdAt >= startOfMonth) sumMonth += price;
				}

				tr.innerHTML = `
					<td>${dateStr}</td>
					<td>${service}</td>
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

		// ---------- Delete single entry ----------
		tableBody.addEventListener("click", async (e) => {
			const btn = e.target.closest("button[data-id]");
			if (!btn) return;
			const id = btn.getAttribute("data-id");

			if (!confirm("Delete this entry?")) return;

			await fs.deleteDoc(fs.doc(db, "entries", id));
		});

		// ---------- Delete by period (day / week / month) ----------
		window.clearPeriod = async function (period) {
			if (!["day", "week", "month"].includes(period)) return;

			let label =
				period === "day"
					? "all entries from today?"
					: period === "week"
					? "all entries from this week?"
					: "all entries from this month?";

			if (!confirm(`Are you sure you want to delete ${label}`)) return;

			const now = new Date();
			let start;

			const startOfDay = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate()
			);
			const startOfWeek = new Date(startOfDay);
			startOfWeek.setDate(startOfWeek.getDate() - startOfDay.getDay());
			const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

			if (period === "day") start = startOfDay;
			if (period === "week") start = startOfWeek;
			if (period === "month") start = startOfMonth;

			try {
				const q = fs.query(entriesCol, fs.where("createdAt", ">=", start));
				const snap = await fs.getDocs(q);

				if (snap.empty) {
					alert("No entries found for this period.");
					return;
				}

				let count = 0;
				for (const docSnap of snap.docs) {
					await fs.deleteDoc(docSnap.ref);
					count++;
				}

				alert(`Deleted ${count} entries.`);
			} catch (err) {
				console.error("[logbook] clearPeriod error:", err);
				alert("Error deleting entries. Please try again.");
			}
		};

		// ---------- Export CSV ----------
		window.exportCSV = function () {
			if (!currentEntries.length) {
				alert("No entries to export.");
				return;
			}

			let csv = "Date,Service,Price\n";

			currentEntries.forEach((entry) => {
				const dateStr = entry.createdAt
					? entry.createdAt.toISOString().split("T")[0]
					: "";
				const service = (entry.service || "").replace(/"/g, '""');
				const price = entry.price || 0;

				csv += `"${dateStr}","${service}",${price}\n`;
			});

			const blob = new Blob([csv], {
				type: "text/csv;charset=utf-8;",
			});
			const url = URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = "automap-logbook.csv";
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		};
	}

	// ---------- start ----------
	if (window.firebaseDB && window.fs) {
		initLogbook();
	} else {
		window.addEventListener("firebase-ready", initLogbook, { once: true });
	}
})();
