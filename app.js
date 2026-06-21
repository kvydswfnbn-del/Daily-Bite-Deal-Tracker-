let deals = [];
let foodDays = [];

let selectedDate = new Date();
let selectedMonth = new Date();

let selectedFilter = "All";
let selectedCalendarDate = null;

Promise.all([
fetch("./deals.json").then(r => r.json()),
fetch("./food_days.json").then(r => r.json())
])
.then(([dealData, foodDayData]) => {

deals = dealData;
foodDays = foodDayData;
renderFilters();
renderDeals();
renderCalendar();

})
.catch(error => {
console.error("Failed to load data:", error);
});

function getScoreColor(score) {

if (score === 100) return "#F5C542";
if (score >= 90) return "#22C55E";
if (score >= 70) return "#F59E0B";
return "#EF4444";

}

function showPage(pageId, button) {

document
    .querySelectorAll(".page")
    .forEach(page => page.classList.remove("active"));
document
    .querySelectorAll(".navButton")
    .forEach(btn => btn.classList.remove("active"));
document
    .getElementById(pageId)
    .classList.add("active");
button.classList.add("active");

}

function shiftDate(days) {

selectedDate.setDate(
    selectedDate.getDate() + days
);
renderDeals();

}

function shiftMonth(months) {

selectedMonth.setMonth(
    selectedMonth.getMonth() + months
);
renderCalendar();

}

function renderFilters() {

const filters = [
    "All",
    "Top Rated",
    "Great Deals",
    "Good Deals"
    "Freebies"
];
document.getElementById("filters").innerHTML =
    filters.map(filter => `
        <button
            class="filter ${selectedFilter === filter ? "active" : ""}"
            onclick="setFilter('${filter}')">
            ${filter}
        </button>
    `).join("");

}

function setFilter(filter) {

selectedFilter = filter;
renderFilters();
renderDeals();

}

function renderDeals() {

document.getElementById("dateLabel").innerText =
    selectedDate.toDateString();
const dateString =
    selectedDate.toISOString().split("T")[0];
let list =
    deals.filter(
        deal => deal.event_start_date === dateString
    );
if (selectedFilter === "Top Rated") {
    list = list.filter(d => d.bite_score === 100);
}
if (selectedFilter === "Great Deals") {
    list = list.filter(d => d.bite_score >= 90);
}
if (selectedFilter === "Good Deals") {
    list = list.filter(d => d.bite_score >= 70);
}
list.sort(
    (a, b) => b.bite_score - a.bite_score
);
if (list.length === 0) {
    document.getElementById("dealList").innerHTML = `
        <div class="settingsCard">
            No deals found for this date.
        </div>
    `;
    return;
}
document.getElementById("dealList").innerHTML =
    list.map(deal => `
        <div class="dealCard">
            <div class="dealTop">
                ${buildScoreRing(deal.bite_score)}
                <div>
                    <div class="cardTitle">
                        ${deal.title}
                    </div>
                </div>
            </div>
            <div class="cardDesc">
                ${deal.description || ""}
            </div>
            <button class="sourceBtn">
                View Source
            </button>
        </div>
    `).join("");

}

function renderCalendar() {

const weekdays = [
    "S",
    "M",
    "T",
    "W",
    "T",
    "F",
    "S"
];
document.getElementById("weekdays").innerHTML =
    weekdays
        .map(day => `<div>${day}</div>`)
        .join("");
document.getElementById("monthLabel").innerText =
    selectedMonth.toLocaleString(
        "default",
        {
            month: "long",
            year: "numeric"
        }
    );
const year =
    selectedMonth.getFullYear();
const month =
    selectedMonth.getMonth();
const firstDay =
    new Date(year, month, 1).getDay();
const totalDays =
    new Date(year, month + 1, 0).getDate();
let html = "";
for (let i = 0; i < firstDay; i++) {
    html += "<div></div>";
}
for (let day = 1; day <= totalDays; day++) {
    const date =
        `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const selected =
        selectedCalendarDate === date
            ? "selected"
            : "";
    html += `
        <div
            class="day ${selected}"
            onclick="selectDay('${date}')">
            <div>${day}</div>
        </div>
    `;
}
document.getElementById("calendarGrid").innerHTML =
    html;

}

function selectDay(date) {

selectedCalendarDate = date;
renderCalendar();
const matches =
    deals.filter(
        deal => deal.event_start_date === date
    );
if (matches.length === 0) {
    document.getElementById("calendarDeals").innerHTML = `
        <div class="settingsCard">
            No food events on this date.
        </div>
    `;
    return;
}
document.getElementById("calendarDeals").innerHTML =
    matches.map(deal => `
        <div class="dealCard">
            <div class="dealTop">
                ${buildScoreRing(deal.bite_score)}
                <div>
                    <div class="cardTitle">
                        ${deal.title}
                    </div>
                </div>
            </div>
            <div class="cardDesc">
                ${deal.description || ""}
            </div>
        </div>
    `).join("");

}

function buildScoreRing(score) {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const color = getScoreColor(score);

    return `
    <div class="scoreRing">
        <svg width="56" height="56">
            <circle
                cx="28"
                cy="28"
                r="${radius}"
                stroke="#1f2937"
                stroke-width="4"
                fill="none"
            />
            <circle
                cx="28"
                cy="28"
                r="${radius}"
                stroke="${color}"
                stroke-width="4"
                fill="none"
                stroke-linecap="round"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"
                transform="rotate(-90 28 28)"
            />
        </svg>
        <div class="scoreText">${score}</div>
    </div>
    `;
}