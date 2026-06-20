let deals = [];
let foodDays = [];

let selectedDate = new Date();
let selectedMonth = new Date();

let selectedFilter = "All";
let selectedCalendarDate = null;

function getScoreColor(score){
    if(score === 100){
        return "#F5C542"; // Gold
    }
    if(score >= 90){
        return "#22C55E"; // Green
    }
    if(score >= 70){
        return "#F59E0B"; // Orange
    }
    return "#EF4444"; // Red
}

function buildScoreRing(score){
    const radius = 46;
    const circumference = 2 * Math.PI * radius;
    const fill =
        circumference * (score / 100);
    const color =
        getScoreColor(score);
    return `
        <svg
            width="120"
            height="120"
            viewBox="0 0 120 120">
            <circle
                cx="60"
                cy="60"
                r="${radius}"
                stroke="#30363d"
                stroke-width="10"
                fill="none"/>
            <circle
                cx="60"
                cy="60"
                r="${radius}"
                stroke="${color}"
                stroke-width="10"
                fill="none"
                stroke-linecap="round"
                stroke-dasharray="${fill} ${circumference}"
                transform="rotate(-90 60 60)"/>
            <text
                x="60"
                y="68"
                text-anchor="middle"
                class="scoreNumber">
                ${score}
            </text>
        </svg>
    `;
}

Promise.all([
fetch("./deals.json").then(r=>r.json()),
fetch("./food_days.json").then(r=>r.json())
]).then(([d,f])=>{

deals=d;
foodDays=f;

renderFilters();
renderDeals();
renderCalendar();

});

function showPage(page,btn){

document
.querySelectorAll(".page")
.forEach(x=>x.classList.remove("active"));

document
.querySelectorAll(".navButton")
.forEach(x=>x.classList.remove("active"));

document
.getElementById(page)
.classList.add("active");

btn.classList.add("active");
}

function shiftDate(days){

selectedDate.setDate(
selectedDate.getDate()+days
);

renderDeals();
}

function shiftMonth(months){

selectedMonth.setMonth(
selectedMonth.getMonth()+months
);

renderCalendar();
}

function renderFilters(){

const filters=["All","100","90+","70+"];

document.getElementById("filters").innerHTML=
filters.map(f=>`
<button class="filter ${selectedFilter===f?'active':''}" onclick="setFilter('${f}')">
${f}
</button>
`).join("");
}

function setFilter(f){

selectedFilter=f;

renderFilters();
renderDeals();
}

function renderDeals(){

document.getElementById("dateLabel").innerText =
selectedDate.toDateString();

const dateString =
selectedDate.toISOString().split("T")[0];

// Strictly pull only matching single-day deals
let list = deals.filter(
    d => d.event_start_date === dateString
);

if(selectedFilter==="100")
list=list.filter(x=>x.bite_score===100);

if(selectedFilter==="90+")
list=list.filter(x=>x.bite_score>=90);

if(selectedFilter==="70+")
list=list.filter(x=>x.bite_score>=70);

list.sort((a,b)=>b.bite_score-a.bite_score);

document.getElementById("dealList").innerHTML=
list.map(d=>`
<div class="card" style="border-left-color:${getScoreColor(d.bite_score)}">
<div class="scoreWrap">
${buildScoreRing(d.bite_score)}
</div>
<div>
<div class="cardTitle">
${d.title}
</div>
<div class="cardDesc">
${d.description}
</div>
<button class="sourceBtn">
View Source
</button>
</div>
</div>
`).join("");
}

function renderCalendar(){

const weekdays=
["S","M","T","W","T","F","S"];

document.getElementById("weekdays").innerHTML=
weekdays.map(x=>`<div>${x}</div>`).join("");

document.getElementById("monthLabel").innerText=
selectedMonth.toLocaleString(
"default",
{
month:"long",
year:"numeric"
}
);

const year=
selectedMonth.getFullYear();

const month=
selectedMonth.getMonth();

const first=
new Date(year,month,1).getDay();

const totalDays=
new Date(year,month+1,0).getDate();

let html="";

for(let i=0;i<first;i++)
html+="<div></div>";

for(let day=1;day<=totalDays;day++){

const date=
`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

// Check if this loop day is the currently selected calendar day
const isSelected = date === selectedCalendarDate ? "selected" : "";

html+=`
<div
class="day ${isSelected}"
onclick="selectDay('${date}')">
<div>${day}</div>
</div>
`;

}

document.getElementById("calendarGrid").innerHTML=html;

renderHolidayList();
}

function renderHolidayList(){
// Filter out everything except the holiday that matches the selected date
const filteredHolidays = foodDays.filter(h => h.date === selectedCalendarDate);

document.getElementById("holidayList").innerHTML=
filteredHolidays.map(h=>`
<div class="holidayRow">
<div class="holidayTitle">
${h.title}
</div>
<div>
${h.date}
</div>
</div>
`).join("");
}

function selectDay(date){

selectedCalendarDate=date;

// Re-render calendar so the new selected day receives the 'selected' class highlight
renderCalendar();

const matches=
deals.filter(
d=>d.event_start_date===date
);

document.getElementById("calendarDeals").innerHTML=
matches.map(d=>`
<div class="card" style="border-left-color:${getScoreColor(d.bite_score)}">
<div class="scoreWrap">
${buildScoreRing(d.bite_score)}
</div>
<div>
<div class="cardTitle">
${d.title}
</div>
<div class="cardDesc">
${d.description}
</div>
</div>
</div>
`).join("");
}
