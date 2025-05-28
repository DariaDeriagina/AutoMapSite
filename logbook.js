const form = document.getElementById("logForm");
const table = document.getElementById("logTable");
const serviceSelect = document.getElementById("serviceSelect");
const serviceInput = document.getElementById("service");
const clearBtn = document.getElementById("clearForm");

serviceSelect.addEventListener("change", () => {
	if (serviceSelect.value) {
		serviceInput.value = serviceSelect.value;
	}
});

let entries = JSON.parse(localStorage.getItem("logEntries") || "[]");

function saveEntries() {
	localStorage.setItem("logEntries", JSON.stringify(entries));
}

function renderTable() {
	table.innerHTML = "";
	entries.forEach((entry, index) => {
		const row = document.createElement("tr");
		row.innerHTML = `
      <td>${entry.date}</td>
      <td contenteditable onblur="updateEntry(${index}, 'service', this.textContent)">${entry.service}</td>
      <td contenteditable onblur="updateEntry(${index}, 'price', this.textContent)">$${entry.price}</td>
      <td><span class="delete-btn" onclick="deleteEntry(${index})">Delete</span></td>
    `;
		table.appendChild(row);
	});
}

function updateEntry(index, field, value) {
	if (field === "price") value = parseFloat(value.replace("$", "")) || 0;
	entries[index][field] = value;
	saveEntries();
	getTotals();
}

function deleteEntry(index) {
	if (confirm("Are you sure you want to delete this entry?")) {
		entries.splice(index, 1);
		saveEntries();
		renderTable();
		getTotals();
	}
}

function clearPeriod(type) {
	const now = new Date();
	const today = now.toISOString().split("T")[0];
	const startOfWeek = new Date(now);
	startOfWeek.setDate(now.getDate() - now.getDay());
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	entries = entries.filter((entry) => {
		const entryDate = new Date(entry.date);
		if (type === "day") return entry.date !== today;
		if (type === "week") return entryDate < startOfWeek;
		if (type === "month") return entryDate < startOfMonth;
		return true;
	});
	saveEntries();
	renderTable();
	getTotals();
}

function getTotals() {
	const now = new Date();
	const today = now.toISOString().split("T")[0];
	const startOfWeek = new Date(now);
	startOfWeek.setDate(now.getDate() - now.getDay());
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	let totalDay = 0,
		totalWeek = 0,
		totalMonth = 0;

	entries.forEach((entry) => {
		const entryDate = new Date(entry.date);
		if (entry.date === today) totalDay += entry.price;
		if (entryDate >= startOfWeek) totalWeek += entry.price;
		if (entryDate >= startOfMonth) totalMonth += entry.price;
	});

	document.getElementById("totalDay").textContent = `Today: $${totalDay}`;
	document.getElementById("totalWeek").textContent = `This Week: $${totalWeek}`;
	document.getElementById(
		"totalMonth"
	).textContent = `This Month: $${totalMonth}`;
}

function exportCSV() {
	let csv = "Date,Service,Price\n";
	entries.forEach((e) => {
		csv += `${e.date},${e.service},${e.price}\n`;
	});
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	const filename = `automap_expenses_${
		new Date().toISOString().split("T")[0]
	}.csv`;
	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	link.click();
}

form.addEventListener("submit", (e) => {
	e.preventDefault();
	const service = serviceInput.value.trim();
	const price = parseFloat(document.getElementById("price").value);
	const date = new Date().toISOString().split("T")[0];

	entries.push({ service, price, date });
	saveEntries();
	renderTable();
	getTotals();
	form.reset();
	serviceSelect.value = "";
});

clearBtn.addEventListener("click", () => {
	if (confirm("Clear all form fields?")) {
		form.reset();
		serviceSelect.value = "";
	}
});

renderTable();
getTotals();
