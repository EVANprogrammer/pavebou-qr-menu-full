const emojiMap = {
    "Καφέδες": "☕", "Ροφήματα": "🍫", "Παγωτά": "🍨", "Βάφλες": "🧇", "Βαφλάκια":"🧇",
  "Κρέπες":"🥞", "Pancakes":"🥞", "Γλυκά ταψιού":"🍰", "Snacks":"🥪",
  "Club & Μπουκιές":"🥪", "Σαλάτες":"🥗", "Πρωινά":"🍳", "Ποτά":"🍺", "Κοκτέιλ":"🍹"
};

const order = ["Πρωινά","Καφέδες","Ροφήματα","Snacks","Club & Μπουκιές","Σαλάτες","Παγωτά","Βάφλες","Βαφλάκια","Κρέπες","Pancakes","Γλυκά ταψιού","Ποτά","Κοκτέιλ"];

const state = { data: null, categories: [] };

async function loadMenu(){
  const res = await fetch('menu.json?v=' + Date.now());
  state.data = await res.json();
  // determine categories order
  const cats = [...new Set(state.data.items.map(i => i.category))];
  state.categories = order.filter(c => cats.includes(c)).concat(cats.filter(c => !order.includes(c)));
  build();
}

function build(){
  const content = document.getElementById('content');
  const tabs = document.getElementById('rightTabs');
  content.innerHTML = ''; tabs.innerHTML = '';

  state.categories.forEach(cat => {
    // section
    const sec = document.createElement('section'); sec.className='category'; sec.id = slug(cat);
    const head = document.createElement('div'); head.className='cat-header'; head.textContent = cat; sec.appendChild(head);

    const grid = document.createElement('div'); grid.className='grid';
    state.data.items.filter(i => i.category===cat).forEach(it => grid.appendChild(card(it))); 
    sec.appendChild(grid);

    // per-category inline art where applicable
    if(cat==='Βαφλάκια'){ const img=document.createElement('img'); img.className='cat-inline'; img.src='assets/miniwaffles.png'; img.alt='Βαφλάκια'; sec.appendChild(img); }

    content.appendChild(sec);

    // pill tab
    const b = document.createElement('button'); b.className='pill'; b.innerHTML = `<span class="emoji">${emojiMap[cat]||'•'}</span> <span>${cat}</span>`;
    b.onclick = () => document.getElementById(slug(cat)).scrollIntoView({behavior:'smooth'});
    tabs.appendChild(b);
  });

  // scrollspy
  spy();
}

function card(it){
  const c = document.createElement('article'); c.className='card';
  const head = document.createElement('div'); head.className='row';
  const t = document.createElement('div'); t.className='title'; t.textContent = it.name;
  const p = document.createElement('div'); p.className='price'; p.textContent = (state.data.currency||'€') + parseFloat(it.price).toFixed(2);
  head.appendChild(t); head.appendChild(p); c.appendChild(head);
  if(it.description){
    const d = document.createElement('details'); const s=document.createElement('summary'); s.textContent='Περισσότερα'; d.appendChild(s);
    const txt = document.createElement('div'); txt.textContent = it.description; d.appendChild(txt); c.appendChild(d);
  }
  return c;
}

function slug(s){ return s.toLowerCase().replace(/[^a-z0-9\u0370-\u03ff]+/g,'-'); }

function spy(){
  const tabs = [...document.querySelectorAll('.pill')];
  const secs = [...document.querySelectorAll('section.category')];
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const id = e.target.id;
        tabs.forEach(b => b.classList.toggle('active', slug(b.textContent.trim().replace(/^[^\s]+\s*/,'')) === id));
      }
    });
  }, { rootMargin:'-45% 0 -50% 0', threshold:0.01 });
  secs.forEach(s => io.observe(s));
}

loadMenu();