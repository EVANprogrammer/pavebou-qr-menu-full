// Emoji για κατηγορίες (cute & ξεκάθαρα)
const emojiMap = {
  "Καφέδες":"☕",
  "Ροφήματα":"🍫",
  "Παγωτά":"🍨",
  "Βάφλες":"🧇",
  "Βαφλάκια":"🍫🧇",
  "Κρέπες":"🍫🌸",
  "Pancakes":"🥞",
  "Γλυκά ταψιού":"🍰",
  "Snacks":"🥪",
  "Club & Μπουκιές":"🥪",
  "Σαλάτες":"🥗",
  "Πρωινά":"🍳",
  "Ποτά":"🍺",
  "Κοκτέιλ":"🍹"
};

// Προτεινόμενη σειρά
const order = [
  "Πρωινά","Καφέδες","Ροφήματα","Snacks","Club & Μπουκιές","Σαλάτες",
  "Παγωτά","Βάφλες","Βαφλάκια","Κρέπες","Pancakes","Γλυκά ταψιού","Ποτά","Κοκτέιλ"
];

const state = { data: null, categories: [] };

// Βοήθημα: ύψος fixed header (από CSS var ή από #fixedHeader)
function getHeaderH(){
  // 1) από CSS var --header-h
  const root = getComputedStyle(document.documentElement);
  const varVal = root.getPropertyValue('--header-h').trim();
  if (varVal) {
    const m = varVal.match(/(\d+(\.\d+)?)/);
    if (m) return parseFloat(m[1]);
  }
  // 2) από DOM
  const fh = document.getElementById('fixedHeader');
  if (fh) return fh.offsetHeight || 0;
  return 0;
}

async function loadMenu(){
  const res = await fetch('menu.json?v=' + Date.now());
  state.data = await res.json();
  const cats = [...new Set(state.data.items.map(i => i.category))];
  state.categories = order.filter(c => cats.includes(c)).concat(cats.filter(c => !order.includes(c)));
  build();
}

function build(){
  const content = document.getElementById('content');
  const tabs = document.getElementById('rightTabs');
  content.innerHTML = '';
  tabs.innerHTML = '';

  state.categories.forEach(cat => {
    // Section
    const sec = document.createElement('section');
    sec.className = 'category';
    sec.id = slug(cat);

    const head = document.createElement('div');
    head.className = 'cat-header';
    head.textContent = cat;
    sec.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'grid';
    state.data.items
      .filter(i => i.category === cat)
      .forEach(it => grid.appendChild(card(it)));
    sec.appendChild(grid);

    // Inline εικόνα συγκεκριμένης κατηγορίας (όπως είχαμε)
    if (cat === 'Βαφλάκια') {
      const img = document.createElement('img');
      img.className = 'cat-inline';
      img.src = 'assets/miniwaffles.png';
      img.alt = 'Βαφλάκια';
      sec.appendChild(img);
    }

    content.appendChild(sec);

    // Δεξιά καρτέλα (pill)
    const b = document.createElement('button');
    b.className = 'pill';
    b.innerHTML = `<span class="emoji">${emojiMap[cat] || '•'}</span> <span>${cat}</span>`;
    b.onclick = () => scrollToSection(slug(cat));
    tabs.appendChild(b);
  });

  // Scrollspy
  spy();
}

// Κάρτα προϊόντος
function card(it){
  const c = document.createElement('article'); c.className='card';
  const head = document.createElement('div'); head.className='row';
  const t = document.createElement('div'); t.className='title'; t.textContent = it.name;
  const p = document.createElement('div'); p.className='price'; p.textContent = (state.data.currency||'€') + parseFloat(it.price).toFixed(2);
  head.appendChild(t); head.appendChild(p); c.appendChild(head);
  if(it.description){
    const d = document.createElement('details');
    const s = document.createElement('summary'); s.textContent='Περισσότερα'; d.appendChild(s);
    const txt = document.createElement('div'); txt.textContent = it.description; d.appendChild(txt);
    c.appendChild(d);
  }
  return c;
}

// Ομαλό scroll με offset για fixed header
function scrollToSection(id){
  const target = document.getElementById(id);
  if (!target) return;
  const headerH = getHeaderH();
  const top = target.getBoundingClientRect().top + window.scrollY - (headerH + 12);
  window.scrollTo({ top, behavior: 'smooth' });
}

// Καθαρό slug στα ελληνικά
function slug(s){ return s.toLowerCase().replace(/[^a-z0-9\u0370-\u03ff]+/g,'-'); }

// ScrollSpy που λαμβάνει υπόψη το fixed header
function spy(){
  const tabs = [...document.querySelectorAll('.pill')];
  const secs = [...document.querySelectorAll('section.category')];
  const headerH = getHeaderH();

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const id = e.target.id;
        tabs.forEach(b => {
          // βγάζουμε το emoji από το text (πρώτη "λέξη")
          const label = b.textContent.trim().replace(/^[^\s]+\s*/, '');
          b.classList.toggle('active', slug(label) === id);
        });
      }
    });
  }, {
    // μετακινούμε το "παράθυρο" παρατήρησης κάτω από το header
    rootMargin: `${-headerH - 10}px 0% -50% 0%`,
    threshold: 0.01
  });

  secs.forEach(s => io.observe(s));
}

loadMenu();