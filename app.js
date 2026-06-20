let deals = [];
let foodDays = [];

let selectedDate = new Date();
let selectedMonth = new Date();

let selectedFilter = "All";
let selectedCalendarDate = null;

let dealViewMode = "day";

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

function setViewMode(mode){

dealViewMode=mode;

document
.getElementById("dayToggle")
.classList.toggle("active",mode==="day");

document
.getElementById("weekToggle")
.classList.toggle("active",mode==="week");

renderDeals();
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

let list=[];

if(dealViewMode==="day"){

list=deals.filter(
d=>d.event_start_date===dateString
);

}else{

let end=new Date(selectedDate);
end.setDate(end.getDate()+6);

list=deals.filter(d=>{

let dealDate =
new Date(d.event_start_date);

return dealDate>=selectedDate
&& dealDate<=end;

});

}

if(selectedFilter==="100")
list=list.filter(x=>x.bite_score===100);

if(selectedFilter==="90+")
list=list.filter(x=>x.bite_score>=90);

if(selectedFilter==="70+")
list=list.filter(x=>x.bite_score>=70);

list.sort((a,b)=>b.bite_score-a.bite_score);

document.getElementById("dealList").innerHTML=
list.map(d=>`
<div class="card">
<div class="scoreWrap">
${d.bite_score}
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

html+=`
<div
class="day"
onclick="selectDay('${date}')">
<div>${day}</div>
</div>
`;

}

document.getElementById("calendarGrid").innerHTML=html;

renderHolidayList();
}

function renderHolidayList(){

document.getElementById("holidayList").innerHTML=
foodDays.map(h=>`
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

const matches=
deals.filter(
d=>d.event_start_date===date
);

document.getElementById("calendarDeals").innerHTML=
matches.map(d=>`
<div class="card">
<div class="scoreWrap">
${d.bite_score}
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
