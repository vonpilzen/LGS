const URL_ITEMS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6B8lxSNNQnv3SinXRbv1iHZ-fTD-2lxC9AN-4p4GFDZBCYtZad67ATf4GEKKHxUZW7HsSu9yWmKM9/pub?gid=321053736&single=true&output=csv";
const URL_SENSORS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6B8lxSNNQnv3SinXRbv1iHZ-fTD-2lxC9AN-4p4GFDZBCYtZad67ATf4GEKKHxUZW7HsSu9yWmKM9/pub?gid=1029009444&single=true&output=csv";
const URL_WEAPONS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6B8lxSNNQnv3SinXRbv1iHZ-fTD-2lxC9AN-4p4GFDZBCYtZad67ATf4GEKKHxUZW7HsSu9yWmKM9/pub?gid=1016458194&single=true&output=csv";

let ITEMS=[], SENSORS=[], WEAPONS=[];
let LANG = localStorage.lang || "es";

const T = {
  es:{country:"País",category:"Categoría"},
  en:{country:"Country",category:"Category"}
};

function t(k){ return T[LANG][k]; }

function setLang(l){
  localStorage.lang=l;
  location.reload();
}

Papa.parse(URL_ITEMS,{download:true,header:true,complete:r=>{
  ITEMS=r.data.filter(x=>x.ID);
  Papa.parse(URL_SENSORS,{download:true,header:true,complete:s=>{
    SENSORS=s.data;
    Papa.parse(URL_WEAPONS,{download:true,header:true,complete:w=>{
      WEAPONS=w.data;
      init();
    }});
  }});
}});

function init(){
  fill("country",ITEMS.map(i=>i.Country));
  fill("category",ITEMS.map(i=>i.Category));
  render(shuffle(ITEMS).slice(0,6));
  renderStats();
}

function fill(id,data){
  const e=document.getElementById(id);
  e.innerHTML=`<option value="">${t(id)}</option>`;
  [...new Set(data)].sort().forEach(v=>e.innerHTML+=`<option>${v}</option>`);
  e.onchange=filter;
}

function filter(){
  const c=country.value,k=category.value;
  render(ITEMS.filter(i=>(!c||i.Country===c)&&(!k||i.Category===k)));
}

function render(list){
  cards.innerHTML="";
  list.forEach(i=>{
    cards.innerHTML+=`
    <div class="col-md-4">
      <div class="card bg-secondary h-100 text-light" onclick="openItem('${i.ID}')">
        <div class="card-body">
          <h6>${i.Name}</h6>
          <span class="badge bg-primary">${i.Category}</span>
          <p class="small mt-2">${i.Description.slice(0,100)}…</p>
        </div>
      </div>
    </div>`;
  });
}

function openItem(id){
  const i=ITEMS.find(x=>x.ID===id);
  modalTitle.textContent=i.Name;
  modalBody.innerHTML=`
  <p>${i.Description}</p>
  <ul class="nav nav-tabs">
    <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#s">Sensors</button></li>
    <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#w">Weapons</button></li>
  </ul>
  <div class="tab-content mt-2">
    <div class="tab-pane fade show active" id="s">${renderSub(SENSORS,id)}</div>
    <div class="tab-pane fade" id="w">${renderSub(WEAPONS,id)}</div>
  </div>`;
  new bootstrap.Modal(itemModal).show();
}

function renderSub(arr,id){
  const l=arr.filter(x=>x.ItemID===id);
  return l.length?l.map(x=>`<div>${x.Name} (${x.MaxRange_km||"?"} km)</div>`).join(""):"<p>No data</p>";
}

function renderStats(){
  stats.innerHTML=`
  <div class="col">${ITEMS.length} Items</div>
  <div class="col">${new Set(ITEMS.map(i=>i.Country)).size} Countries</div>
  <div class="col">${SENSORS.length} Sensors</div>
  <div class="col">${WEAPONS.length} Weapons</div>`;
}

function shuffle(a){return a.sort(()=>0.5-Math.random());}
