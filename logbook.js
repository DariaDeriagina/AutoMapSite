// ===============================
// Logbook (Firestore, RU UI)
// Полная замена файла logbook.js
// ===============================

// DOM
const form = document.getElementById("logForm");
const table = document.getElementById("logTable");
const serviceSelect = document.getElementById("serviceSelect");
const serviceInput = document.getElementById("service");
const clearBtn = document.getElementById("clearForm");

// Кнопки (могут отсутствовать в HTML — проверяем)
const exportJsonBtn = document.getElementById("exportJson");
const importJsonInput = document.getElementById("importJson");

// Firestore (из firebase.js)
const db = window.firebaseDB;
const fs = window.fs;
const WS = "automap"; // рабочее пространство (коллекция в Firestore)
const entriesRef = () => fs.collection(db, "workspaces", WS, "entries");

// Глобальные данные для рендера (приходят из onSnapshot)
let entries = [];

// ===============================
// Утилиты даты/форматирования
// ===============================

// YYYY-MM-DD (локальная дата, без UTC-сдвига)
function todayYMD() {
	const n = new Date();
	const y = n.getFullYear();
	const m = String(n.getMonth() + 1).padStart(2, "0");
	const d = String(n.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}
function parseLocalYMD(ymd) {
	const [y, m, d] = (ymd || "").split("-").map(Number);
	return new Date(y, (m || 1) - 1, d || 1);
}
function startOfWeekLocal(date = new Date()) {
	const tmp = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const diff = tmp.getDay(); // Воскресенье = 0
	tmp.setDate(tmp.getDate() - diff);
	return tmp;
}
function startOfMonthLocal(date = new Date()) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Формат цены в CAD, без копеек (как у тебя в UI)
const currency = new Intl.NumberFormat("ru-CA", {
	style: "currency",
	currency: "CAD",
	maximumFractionDigits: 0,
});

// ===============================
// Подписка Firestore (real-time)
// ===============================
fs.onAuthStateChanged(window.firebaseAuth, (user) => {
	if (!user) return;
	const q = fs.query(entriesRef(), fs.orderBy("date", "desc"));
	fs.onSnapshot(q, (snap) => {
		entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
		renderTable();
		renderTotals();
	});
});

// ===============================
// Рендер таблицы / итогов
// ===============================
function renderTable() {
	table.innerHTML = "";
	// уже пришло отсортированным по "date" desc из запроса, но на всякий случай:
	const list = entries.slice().sort((a, b) => (a.date < b.date ? 1 : -1));

	list.forEach((entry, index) => {
		const row = document.createElement("tr");

		// Дата
		const tdDate = document.createElement("td");
		tdDate.textContent = entry.date || "";

		// Услуга (редактируемая ячейка)
		const tdService = document.createElement("td");
		tdService.contentEditable = "true";
		tdService.setAttribute("role", "textbox");
		tdService.setAttribute("aria-label", "Услуга (редактируется)");
		tdService.textContent = entry.service || "";
		tdService.addEventListener("blur", async () => {
			await updateEntry(index, "service", tdService.textContent);
		});

		// Цена (редактируемая ячейка)
		const tdPrice = document.createElement("td");
		tdPrice.contentEditable = "true";
		tdPrice.setAttribute("role", "textbox");
		tdPrice.setAttribute("aria-label", "Цена (редактируется)");
		tdPrice.textContent = currency.format(Number(entry.price) || 0);
		tdPrice.addEventListener("blur", async () => {
			const raw = tdPrice.textContent.replace(/[^\d.]/g, "");
			const val = Math.max(0, Math.round(parseFloat(raw) || 0));
			await updateEntry(index, "price", val);
			tdPrice.textContent = currency.format(val);
		});

		// Действие
		const tdAction = document.createElement("td");
		const delBtn = document.createElement("button");
		delBtn.className = "btn btn-sm btn-outline-danger";
		delBtn.textContent = "Удалить";
		delBtn.addEventListener("click", async () => {
			await deleteEntry(index);
		});
		tdAction.appendChild(delBtn);

		row.append(tdDate, tdService, tdPrice, tdAction);
		table.appendChild(row);
	});
}

function renderTotals() {
	const now = new Date();
	const today = todayYMD();
	const weekStart = startOfWeekLocal(now);
	const monthStart = startOfMonthLocal(now);

	let totalDay = 0,
		totalWeek = 0,
		totalMonth = 0;

	entries.forEach((e) => {
		const d = parseLocalYMD(e.date);
		const price = Number(e.price) || 0;
		if (e.date === today) totalDay += price;
		if (d >= weekStart) totalWeek += price;
		if (d >= monthStart) totalMonth += price;
	});

	document.getElementById("totalDay").textContent = `Сегодня: ${currency.format(
		totalDay
	)}`;
	document.getElementById(
		"totalWeek"
	).textContent = `Эта неделя: ${currency.format(totalWeek)}`;
	document.getElementById(
		"totalMonth"
	).textContent = `Этот месяц: ${currency.format(totalMonth)}`;
}

// ===============================
// Обработчики формы/кнопок
// ===============================
serviceSelect.addEventListener("change", () => {
	if (serviceSelect.value) {
		serviceInput.value = serviceSelect.value;
		serviceInput.focus();
	}
});

form.addEventListener("submit", async (e) => {
	e.preventDefault();
	const service = serviceInput.value.trim();
	const price = Math.max(
		0,
		Math.round(parseFloat(document.getElementById("price").value || "0"))
	);
	const date = todayYMD();

	if (!service || isNaN(price)) {
		alert("Введите услугу и стоимость.");
		return;
	}

	await fs.addDoc(entriesRef(), {
		service,
		price,
		date,
		createdAt: fs.serverTimestamp(),
	});

	form.reset();
	serviceSelect.value = "";
});

clearBtn.addEventListener("click", () => {
	if (confirm("Очистить поля формы?")) {
		form.reset();
		serviceSelect.value = "";
	}
});

// Экспорт CSV (RU заголовки)
function exportCSV() {
	const header = "Дата,Услуга,Цена (CAD)\n";
	const rows = entries
		.slice()
		.sort((a, b) => (a.date < b.date ? 1 : -1))
		.map(
			(e) =>
				`${e.date},"${String(e.service || "").replace(/"/g, '""')}",${
					Number(e.price) || 0
				}`
		)
		.join("\n");
	const csv = "\uFEFF" + header + rows; // BOM для Excel
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `automap_zhurnal_${todayYMD()}.csv`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
window.exportCSV = exportCSV; // чтобы работало из onClick в HTML

// ===============================
// Операции Firestore
// ===============================
async function updateEntry(index, field, value) {
	const item = entries[index];
	if (!item || !item.id) return;
	const ref = fs.doc(db, "workspaces", WS, "entries", item.id);

	// нормализуем
	let patch = {};
	if (field === "price") {
		patch.price = Math.max(
			0,
			Math.round(parseFloat(String(value).replace(/[^\d.]/g, "")) || 0)
		);
	} else if (field === "service") {
		patch.service = String(value).trim();
	} else if (field === "date") {
		patch.date = String(value).slice(0, 10);
	} else {
		patch[field] = value;
	}

	await fs.updateDoc(ref, patch);
}

async function deleteEntry(index) {
	if (!confirm("Удалить эту запись?")) return;
	const item = entries[index];
	if (!item || !item.id) return;
	await fs.deleteDoc(fs.doc(db, "workspaces", WS, "entries", item.id));
}

async function clearPeriod(type) {
	const now = new Date();
	const today = todayYMD();
	const weekStart = startOfWeekLocal(now);
	const monthStart = startOfMonthLocal(now);

	const toDelete = entries.filter((e) => {
		const d = parseLocalYMD(e.date);
		if (type === "day") return e.date === today;
		if (type === "week") return d >= weekStart;
		if (type === "month") return d >= monthStart;
		return false;
	});

	if (!toDelete.length) return;
	if (!confirm(`Удалить ${toDelete.length} запис(ь/и)?`)) return;

	const batch = fs.writeBatch(db);
	toDelete.forEach((e) => {
		batch.delete(fs.doc(db, "workspaces", WS, "entries", e.id));
	});
	await batch.commit();
}
window.clearPeriod = clearPeriod; // используется из onClick в HTML

// ===============================
// (Необязательно) Резервная копия JSON / Импорт JSON
// Если в HTML есть кнопки с id="exportJson" и input#importJson — это активируется.
// ===============================
if (exportJsonBtn) {
	exportJsonBtn.addEventListener("click", () => {
		const data = JSON.stringify(entries, null, 2);
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `automap_log_${todayYMD()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	});
}

if (importJsonInput) {
	importJsonInput.addEventListener("change", (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = async () => {
			try {
				const incoming = JSON.parse(reader.result);
				if (!Array.isArray(incoming)) throw new Error("Неверный формат");
				const replace = confirm(
					"OK = заменить текущие данные в облаке. Cancel = объединить (без дублей)."
				);

				// загрузим текущие ids, чтобы корректно объединять
				const existingKeys = new Set(
					entries.map((x) => `${x.date}__${x.service}__${x.price}`)
				);

				const batch = fs.writeBatch(db);

				if (replace) {
					// удалить всё текущее
					entries.forEach((e) => {
						if (e.id)
							batch.delete(fs.doc(db, "workspaces", WS, "entries", e.id));
					});
					// добавить импорт
					incoming.forEach((e) => {
						const docRef = fs.doc(entriesRef()); // auto-id через батч не получить, делаем add-like вручную:
						// небольшая хитрость: создаём ref через collection(...).doc() без id → генерим id
					});
				}

				// Поскольку в batched writes нет auto-id через addDoc, сделаем по-другому:
				// Сначала удалим (если replace), потом добавим документами вне батча (это проще и безопасно):
				if (replace) {
					// коммит удаления
					await batch.commit();
					// добавление
					for (const e of incoming) {
						const clean = {
							date: String(e.date || todayYMD()).slice(0, 10),
							service: String(e.service || "").trim(),
							price: Math.max(0, Math.round(Number(e.price) || 0)),
							createdAt: fs.serverTimestamp(),
						};
						await fs.addDoc(entriesRef(), clean);
					}
				} else {
					// объединение: только те, которых нет по ключу дата+услуга+цена
					for (const e of incoming) {
						const key = `${e.date}__${e.service}__${e.price}`;
						if (existingKeys.has(key)) continue;
						const clean = {
							date: String(e.date || todayYMD()).slice(0, 10),
							service: String(e.service || "").trim(),
							price: Math.max(0, Math.round(Number(e.price) || 0)),
							createdAt: fs.serverTimestamp(),
						};
						await fs.addDoc(entriesRef(), clean);
					}
				}

				alert("Импорт завершён.");
				importJsonInput.value = "";
			} catch (err) {
				alert("Ошибка импорта: " + err.message);
			}
		};
		reader.readAsText(file);
	});
}
