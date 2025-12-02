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

		const entriesCol = fs.collection(db, "entries");

		// --- Add entry ---
		form.addEventListener("submit", async (e) => {
			e.preventDefault();

			const service =
				serviceInput.value.trim() || serviceSelect.value.trim() || "";
			const price = Number(priceInput.value);

			if (!service || !price) return;

			await fs.addDoc(entriesCol, {
				service,
				price,
				createdAt: fs.serverTimestamp(),
			});

			serviceInput.value = "";
			priceInput.value = "";
			serviceSelect.value = "";
		});

		// --- Listen for entries ---
		const q = fs.query(entriesCol, fs.orderBy("createdAt", "desc"));
		fs.onSnapshot(q, (snapshot) => {
			tableBody.innerHTML = "";
			snapshot.forEach((docSnap) => {
				const data = docSnap.data();
				const tr = document.createElement("tr");

				const date = data.createdAt?.toDate
					? data.createdAt.toDate().toLocaleDateString()
					: "";

				tr.innerHTML = `
					<td>${date}</td>
					<td>${data.service || ""}</td>
					<td>$${data.price || 0}</td>
					<td></td>
				`;

				tableBody.appendChild(tr);
			});
		});
	}

	// If firebase already loaded:
	if (window.firebaseDB && window.fs) {
		initLogbook();
	} else {
		window.addEventListener("firebase-ready", initLogbook, { once: true });
	}
})();
