// Shared inventory logic used by both the desktop (app.js) and mobile (mobile.js)
// pages. Loaded as a classic script before either page script, so these
// constants and functions are available to them as globals.

const STORAGE_KEY = 'hub-sky-inventory-v1';
const SESSION_KEY = 'hub-sky-session';
const SEED_KEY = 'hub-sky-seed-version';
const SEED_VERSION = 2; // bump when defaultInventory should replace a stale built-in seed
const PASSWORD = 'hubandsky'; // default password for the local app

const defaultInventory = [
  { name: "ABSOLUT VODKA (1000ml)", category: "BAR", uom: "L", min: "1 Bot + 760mL", par: "" },
  { name: "Acai Berry Powder", category: "BAR", uom: "KG", min: "147 Grams", par: "" },
  { name: "AMARETTO LIQUEUR (750ml)", category: "BAR", uom: "ML", min: "1 Bot + 100mL", par: "" },
  { name: "AMBIENTE", category: "BAR", uom: "L", min: "10 L", par: "" },
  { name: "ANGOSTURA BITTER", category: "BAR", uom: "ML", min: "300mL", par: "" },
  { name: "ANTONOV VODKA (700ml)", category: "BAR", uom: "ML", min: "33 Bot + 520mL", par: "" },
  { name: "Avocado Powder", category: "BAR", uom: "KG", min: "222 Grams", par: "" },
  { name: "BACARDI 151", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "BACARDI SUPERIOR (750ml)", category: "BAR", uom: "ML", min: "2 Bot + 130mL", par: "" },
  { name: "BAILEY'S (700ml)", category: "BAR", uom: "ML", min: "2 Bot + 400mL", par: "" },
  { name: "BALLENTINES (700ml)", category: "BAR", uom: "ML", min: "1 Bot + 530mL", par: "" },
  { name: "Bee Pollen", category: "BAR", uom: "GR", min: "57 Grams", par: "" },
  { name: "Beetroot Powder", category: "BAR", uom: "KG", min: "", par: "" },
  { name: "BLUE CURACAO", category: "BAR", uom: "ML", min: "7 Bot + 180mL", par: "" },
  { name: "BOMBAY SAPPHIRE (750ml)", category: "BAR", uom: "ML", min: "3 Bot + 240mL", par: "" },
  { name: "BOTTLED WATER (1000ml)", category: "BAR", uom: "EA", min: "117 Bot", par: "" },
  { name: "BOTTLED WATER (1500ml)", category: "BAR", uom: "EA", min: "", par: "" },
  { name: "BOTTLED WATER 500ML", category: "BAR", uom: "EA", min: "", par: "" },
  { name: "CACHACA", category: "BAR", uom: "ML", min: "1 Bot", par: "" },
  { name: "CALAMANSI JUICE POWDER", category: "BAR", uom: "EA", min: "", par: "" },
  { name: "CAMPARI", category: "BAR", uom: "ML", min: "2 Bot + 170mL", par: "" },
  { name: "CAPTAIN MORGAN", category: "BAR", uom: "L", min: "3 Bot + 180mL", par: "" },
  { name: "CARAMEL SYRUP", category: "BAR", uom: "ML", min: "10 Bot + 500mL", par: "" },
  { name: "CARDAMON", category: "BAR", uom: "KG", min: "", par: "" },
  { name: "CHERRY BRANDY", category: "BAR", uom: "ML", min: "19 Bot + 180mL", par: "" },
  { name: "CHIVAS REGAL (1000ml)", category: "BAR", uom: "L", min: "1 Bot + 480mL", par: "" },
  { name: "CHOCOLATE SAUCE", category: "BAR", uom: "L", min: "5 Bot + 300mL", par: "" },
  { name: "CITRIC ACID", category: "BAR", uom: "KG", min: "7 KL", par: "" },
  { name: "COCONUT RUM", category: "BAR", uom: "ML", min: "20 Bot + 420mL", par: "" },
  { name: "COFFEE LIQEUER", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "COINTREAU (700ml)", category: "BAR", uom: "ML", min: "2 Bot + 60mL", par: "" },
  { name: "COKE (1500ml)", category: "BAR", uom: "L", min: "114 Bot", par: "" },
  { name: "COKE LIGHT", category: "BAR", uom: "EA", min: "", par: "" },
  { name: "COKE REG (CAN)", category: "BAR", uom: "EA", min: "160 Cans", par: "" },
  { name: "COKE ZERO (CAN)", category: "BAR", uom: "EA", min: "22 Cans", par: "" },
  { name: "COOKIES", category: "BAR", uom: "EA", min: "86 Pack", par: "" },
  { name: "CRANBERRY JUICE", category: "BAR", uom: "L", min: "3 L + 800mL", par: "" },
  { name: "CREAM CHARGER", category: "BAR", uom: "EA", min: "5 Bot", par: "" },
  { name: "DISARONNO", category: "BAR", uom: "ML", min: "1 Bot + 700mL", par: "" },
  { name: "Doking Passion Fruit Jam", category: "BAR", uom: "KG", min: "1.700 kgrams", par: "" },
  { name: "DON PAPA (700ml)", category: "BAR", uom: "ML", min: "2 Bot + 390mL", par: "" },
  { name: "Dried Lavender", category: "BAR", uom: "GR", min: "", par: "" },
  { name: "EL HOMBRE GOLD/SILVER (700ml)", category: "BAR", uom: "ML", min: "117 Bot + 280mL", par: "" },
  { name: "FIRE BALL (750ml)", category: "BAR", uom: "ML", min: "1 Bot + 60mL", par: "" },
  { name: "FRESH COCONUT", category: "BAR", uom: "EA", min: "", par: "" },
  { name: "FRESH MILK", category: "BAR", uom: "L", min: "182 L", par: "" },
  { name: "GILBEYS GIN (1000ml)", category: "BAR", uom: "L", min: "", par: "" },
  { name: "GILBEYS VODKA (1000ml)", category: "BAR", uom: "L", min: "", par: "" },
  { name: "GRAND MARINIER (700ml)", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "Grassfed Butter Powder", category: "BAR", uom: "KG", min: "", par: "" },
  { name: "GRENADINE (700ml)", category: "BAR", uom: "ML", min: "5 Bot + 400mL", par: "" },
  { name: "GREY GOOSE (750ml)", category: "BAR", uom: "ML", min: "2 Bot + 120mL", par: "" },
  { name: "GSM GIN (750ml)", category: "BAR", uom: "ML", min: "170 Bot + 570mL", par: "" },
  { name: "HAZELNUT SYRUP", category: "BAR", uom: "ML", min: "10 Bot", par: "" },
  { name: "HENDRICKS GIN (750ml)", category: "BAR", uom: "ML", min: "2 Bot", par: "" },
  { name: "HENNESSY VSOP (700ml)", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "HOUSE RED WINE", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "ICE TEA POWDER", category: "BAR", uom: "EA", min: "51 Pack", par: "" },
  { name: "INFERNO (700ml)", category: "BAR", uom: "ML", min: "1 Bot + 240mL", par: "" },
  { name: "JACK DANIELS (1000ml)", category: "BAR", uom: "L", min: "1 Bot + 680mL", par: "" },
  { name: "JAGERMEISTER (700ml)", category: "BAR", uom: "ML", min: "4 Bot + 450mL", par: "" },
  { name: "JAMAICA", category: "BAR", uom: "ML", min: "80 Bot", par: "" },
  { name: "JAMESON (700ml)", category: "BAR", uom: "ML", min: "1 Bot + 420mL", par: "" },
  { name: "JIM BEAM (1000ml)", category: "BAR", uom: "L", min: "1 Bot + 980mL", par: "" },
  { name: "JOSE CUERVO (1000ml)", category: "BAR", uom: "L", min: "4 Bot + 60mL", par: "" },
  { name: "JW BLACK LABEL (1000ml)", category: "BAR", uom: "L", min: "2 Bot + 440mL", par: "" },
  { name: "JW RED LABEL (1000ml)", category: "BAR", uom: "L", min: "2 Bot + 880mL", par: "" },
  { name: "KAHLUA (1000ml)", category: "BAR", uom: "ML", min: "1 Bot + 370mL", par: "" },
  { name: "LEMON", category: "BAR", uom: "EA", min: "80 Pcs", par: "" },
  { name: "LIME", category: "BAR", uom: "KG", min: "", par: "" },
  { name: "LYCHEE POWDER", category: "BAR", uom: "EA", min: "", par: "" },
  { name: "Maca Root Powder", category: "BAR", uom: "KG", min: "120 Grams", par: "" },
  { name: "MALIBU (700ml)", category: "BAR", uom: "ML", min: "3 Bot + 260mL", par: "" },
  { name: "MANGO POWDER", category: "BAR", uom: "EA", min: "48 Pack", par: "" },
  { name: "Marine Collagen", category: "BAR", uom: "KG", min: "800 Grams", par: "" },
  { name: "MARTINI EXTRA DRY", category: "BAR", uom: "L", min: "1 Bot", par: "" },
  { name: "MARTINI ROSSO", category: "BAR", uom: "L", min: "3 Bot", par: "" },
  { name: "Matcha (Ceremonial Grade)", category: "BAR", uom: "KG", min: "374 Grams", par: "" },
  { name: "MAURO COFFEE BEAN", category: "BAR", uom: "KG", min: "20 KL", par: "" },
  { name: "MCT Oil C8 Blend", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "MCT Oil Powder", category: "BAR", uom: "KG", min: "", par: "" },
  { name: "MELON LIQUOR", category: "BAR", uom: "ML", min: "11 Bot + 380mL", par: "" },
  { name: "MELON POWDER JUICE", category: "BAR", uom: "EA", min: "", par: "" },
  { name: "MENTHE GREEN", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "MIDORI (700ml)", category: "BAR", uom: "L", min: "2 Bot + 420mL", par: "" },
  { name: "NAPOLEON VSOP", category: "BAR", uom: "ML", min: "1 Bot + 510mL", par: "" },
  { name: "ORANGE", category: "BAR", uom: "EA", min: "", par: "" },
  { name: "PATRON REPOSADO (750ml)", category: "BAR", uom: "ML", min: "2 Bot + 455mL", par: "" },
  { name: "PATRON SILVER (750ml)", category: "BAR", uom: "ML", min: "2 Bot + 180mL", par: "" },
  { name: "PEACH SCHNAPPS", category: "BAR", uom: "ML", min: "2 Bot + 300mL", par: "" },
  { name: "POMELO POWDER", category: "BAR", uom: "EA", min: "", par: "" },
  { name: "PROSECCO WINE", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "Psyllium Fiber", category: "BAR", uom: "GR", min: "54 Grams", par: "" },
  { name: "RED HORSE (BT)", category: "BAR", uom: "EA", min: "450 Bot", par: "" },
  { name: "RED VERMOTH", category: "BAR", uom: "L", min: "", par: "" },
  { name: "REDBULL", category: "BAR", uom: "EA", min: "103 Bot", par: "" },
  { name: "REMY MARTIN V.S.O.P (700ml)", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "REMY MARTIN VSOP", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "RICARD PASTIS", category: "BAR", uom: "L", min: "900mL", par: "" },
  { name: "Rooibos Tea", category: "BAR", uom: "GR", min: "", par: "" },
  { name: "ROYAL (CAN)", category: "BAR", uom: "EA", min: "124 Cans", par: "" },
  { name: "SAMBUCA (700ml)", category: "BAR", uom: "ML", min: "2 Bot + 550mL", par: "" },
  { name: "SAN MIGUEL APPLE (BT)", category: "BAR", uom: "EA", min: "96 Bot", par: "" },
  { name: "SAN MIGUEL LEMON (BT)", category: "BAR", uom: "EA", min: "210 Bot", par: "" },
  { name: "SAN MIGUEL LIGHT (BT)", category: "BAR", uom: "EA", min: "395 Bot", par: "" },
  { name: "SAN MIGUEL PILSEN (BT)", category: "BAR", uom: "EA", min: "360 Bot", par: "" },
  { name: "SODA CHARGER", category: "BAR", uom: "EA", min: "", par: "" },
  { name: "SODA WATER (CAN)", category: "BAR", uom: "EA", min: "140 Cans", par: "" },
  { name: "SOUTHERN COMFORT", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "Spirulina Powder", category: "BAR", uom: "KG", min: "1168 Kgrams", par: "" },
  { name: "SPRITE (1500ml)", category: "BAR", uom: "L", min: "123 Bot", par: "" },
  { name: "SPRITE (CAN)", category: "BAR", uom: "EA", min: "147 Cans", par: "" },
  { name: "STOLICHNAYA (700ml)", category: "BAR", uom: "ML", min: "1 Bot + 520mL", par: "" },
  { name: "STRAWBERRY POWDER JUICE", category: "BAR", uom: "EA", min: "78 Pack", par: "" },
  { name: "STRAWBERRY PUREE", category: "BAR", uom: "ML", min: "3 Bot + 800mL", par: "" },
  { name: "STRAWBERRY SYRUP", category: "BAR", uom: "ML", min: "8 Bot + 200mL", par: "" },
  { name: "SUNQUICK LEMON", category: "BAR", uom: "ML", min: "7 Bot + 760mL", par: "" },
  { name: "TAGAY", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "TANDUAY DARK (750ml)", category: "BAR", uom: "ML", min: "74 Bot + 200mL", par: "" },
  { name: "TANDUAY SUPERIOR", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "TANDUAY WHITE (750ml)", category: "BAR", uom: "ML", min: "121 Bot + 460mL", par: "" },
  { name: "TANG ORANGE POWDER", category: "BAR", uom: "EA", min: "233 Pack", par: "" },
  { name: "TANG PINEAPPLE POWDER", category: "BAR", uom: "EA", min: "124 Pack", par: "" },
  { name: "TANQUERAY GIN (750ml)", category: "BAR", uom: "ML", min: "2 Bot + 45mL", par: "" },
  { name: "TEA", category: "BAR", uom: "EA", min: "4 Box + 88 Pcs", par: "" },
  { name: "TEQUILA ROSE (750ml)", category: "BAR", uom: "ML", min: "1 Bot + 230mL", par: "" },
  { name: "TONIC WATER (CAN)", category: "BAR", uom: "EA", min: "", par: "" },
  { name: "TRIPLE SEC (750ml)", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "Turmeric Powder", category: "BAR", uom: "KG", min: "", par: "" },
  { name: "Vanilla Plant Protein", category: "BAR", uom: "GR", min: "", par: "" },
  { name: "VANILLA SYRUP", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "Virgin Coconut Oil (200ml)", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "Wheatgrass Powder", category: "BAR", uom: "KG", min: "", par: "" },
  { name: "WHITE CASTLE", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "WHITE WINE", category: "BAR", uom: "ML", min: "", par: "" },
  { name: "Mango", category: "Fruits", uom: "EA", min: "mixer", par: "orange" },
  { name: "Pineapple", category: "Fruits", uom: "EA", min: "mixer", par: "pineapple" },
  { name: "watermelon", category: "Fruits", uom: "EA", min: "", par: "" },
  { name: "banana", category: "Fruits", uom: "EA", min: "", par: "" },
  { name: "calamansi", category: "Fruits", uom: "EA", min: "", par: "" },
  { name: "sugar syrup", category: "Fruits", uom: "EA", min: "frozen mixer", par: "mango" },
  { name: "ginger syrup", category: "Fruits", uom: "EA", min: "pineapple", par: "" },
  { name: "SUPER LEMON", category: "Fruits", uom: "EA", min: "orange", par: "" },
  { name: "SOUR MIX", category: "Fruits", uom: "EA", min: "strawberry", par: "" },
  { name: "CHARCOAL POWDER", category: "Fruits", uom: "EA", min: "", par: "" },
  { name: "CHIA SEED", category: "Fruits", uom: "EA", min: "", par: "" },
  { name: "CINAMON", category: "Fruits", uom: "EA", min: "cookies", par: "" }
];

function getStoredInventory() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistInventory(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// Signature of the original 6-item built-in seed (note the "BOMBSAY" typo that
// the full dataset later fixed to "BOMBAY"). Used to detect installs still on
// the legacy seed so they can be safely upgraded.
function looksLikeLegacySeed(list) {
  return Array.isArray(list) && list.length <= 6 &&
    list.some((item) => item && item.name === 'BOMBSAY SAPPHIRE (750ml)');
}

// Returns the inventory to show on load. Seeds the full default list when there
// is no stored data, or when the stored data is still the legacy 6-item seed.
// Genuine user data (anything else) is never overwritten.
function getInitialInventory() {
  const stored = getStoredInventory();
  const alreadySeeded = localStorage.getItem(SEED_KEY) === String(SEED_VERSION);
  if (!Array.isArray(stored) || (!alreadySeeded && looksLikeLegacySeed(stored))) {
    const seedData = defaultInventory.map((item) => ({ ...item }));
    persistInventory(seedData);
    localStorage.setItem(SEED_KEY, String(SEED_VERSION));
    return seedData;
  }
  if (!alreadySeeded) localStorage.setItem(SEED_KEY, String(SEED_VERSION));
  return stored;
}

function escapeHtml(value) {
  return value ? String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])) : '';
}

function normalizeItem(obj) {
  return {
    name: String(obj.name || obj.Name || '').trim(),
    category: String(obj.category || obj.Category || 'BAR').trim(),
    uom: String(obj.uom || obj.UOM || 'EA').trim().toUpperCase(),
    min: String(obj.min || obj.MinOnHand || '').trim(),
    par: String(obj.par || obj.Par || '').trim()
  };
}

function convertToCsv(records) {
  const header = ['Name', 'Category', 'UOM', 'MinOnHand', 'Par'];
  const rows = records.map((item) => [item.name, item.category, item.uom, item.min, item.par].map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(','));
  return [header.join(','), ...rows].join('\n');
}

function parseCsvText(text) {
  const lines = text.trim().split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const header = lines[0].split(',').map((col) => col.replace(/['"\s]/g, '').toLowerCase());
  const isHeader = header.includes('name') && header.includes('category');
  const dataLines = isHeader ? lines.slice(1) : lines;
  return dataLines.reduce((result, row) => {
    const fields = row.match(/(?:"([^"]*)"|[^,]+)/g)?.map((value) => value.replace(/^"|"$/g, '').trim()) || [];
    if (fields.length >= 3) {
      result.push(normalizeItem({
        Name: fields[0],
        Category: fields[1] || 'BAR',
        UOM: fields[2] || 'EA',
        MinOnHand: fields[3] || '',
        Par: fields[4] || ''
      }));
    }
    return result;
  }, []);
}

function parseOcrLines(rawText) {
  const cleaned = rawText.replace(new RegExp(String.fromCharCode(0xA0), 'g'), ' ').replace(/\s*\|\s*/g, ' ').trim();
  const lines = cleaned.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const headerPattern = /name.*category.*uom/i;
  const rows = [];

  for (const line of lines) {
    if (headerPattern.test(line)) continue;
    const parts = line.split(/\s{2,}|\t/).filter(Boolean);
    if (parts.length >= 4) {
      const parsed = guessRowFromParts(parts);
      if (parsed) rows.push(parsed);
      continue;
    }
    const spaceParts = line.split(/\s+/).filter(Boolean);
    if (spaceParts.length >= 4) {
      const parsed = guessRowFromParts(spaceParts);
      if (parsed) rows.push(parsed);
    }
  }
  return rows;
}

function guessRowFromParts(parts) {
  const uomIndex = parts.findIndex((part) => ['L', 'ML', 'EA', 'KG', 'GR', 'BT', 'CAN'].includes(part.toUpperCase()));
  if (uomIndex >= 1) {
    const name = parts.slice(0, uomIndex - 1).join(' ');
    const category = parts[uomIndex - 1] || 'BAR';
    const uom = parts[uomIndex].toUpperCase();
    const remaining = parts.slice(uomIndex + 1);
    const min = remaining[0] || '';
    const par = remaining.slice(1).join(' ') || '';
    return normalizeItem({ Name: name, Category: category, UOM: uom, MinOnHand: min, Par: par });
  }
  if (parts.length >= 5) {
    return normalizeItem({ Name: parts.slice(0, parts.length - 4).join(' '), Category: parts[parts.length - 4], UOM: parts[parts.length - 3], MinOnHand: parts[parts.length - 2], Par: parts[parts.length - 1] });
  }
  return null;
}

async function runOcr(file) {
  // Tesseract.js v4: createWorker is async and there is no worker.load() step.
  const worker = await Tesseract.createWorker({ logger: (m) => console.log(m) });
  try {
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(file);
    return parseOcrLines(text);
  } finally {
    await worker.terminate();
  }
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/* ---------- Calculator (shared by the desktop modal and mobile sheet) ---------- */

// Keypad definition. HTML entities keep this source file ASCII-only.
const CALC_KEYS = [
  { k: 'C', label: 'C', cls: 'calc-fn' },
  { k: 'back', label: '&#9003;', cls: 'calc-fn' },
  { k: '%', label: '%', cls: 'calc-fn' },
  { k: '/', label: '&divide;', cls: 'calc-op' },
  { k: '7', label: '7' }, { k: '8', label: '8' }, { k: '9', label: '9' }, { k: '*', label: '&times;', cls: 'calc-op' },
  { k: '4', label: '4' }, { k: '5', label: '5' }, { k: '6', label: '6' }, { k: '-', label: '&minus;', cls: 'calc-op' },
  { k: '1', label: '1' }, { k: '2', label: '2' }, { k: '3', label: '3' }, { k: '+', label: '+', cls: 'calc-op' },
  { k: 'neg', label: '&plusmn;' }, { k: '0', label: '0' }, { k: '.', label: '.' }, { k: '=', label: '=', cls: 'calc-eq' }
];

function calcKeypadHtml() {
  return CALC_KEYS.map((b) =>
    `<button type="button" class="calc-key ${b.cls || ''}" data-key="${b.k}">${b.label}</button>`
  ).join('');
}

// Units offered when inserting a calculated value into a count field.
const CALC_UNITS = ['mL', 'L', 'Bot', 'Cans', 'Grams', 'kg', 'Pack', 'Pcs', 'Box'];

function defaultUnitForUom(uom) {
  const map = { ML: 'mL', L: 'L', KG: 'kg', GR: 'Grams', EA: 'Pcs' };
  return map[String(uom || '').trim().toUpperCase()] || '';
}

function calcUnitOptionsHtml(selected) {
  const units = CALC_UNITS.slice();
  if (selected && !units.includes(selected)) units.unshift(selected);
  return ['<option value="">(no unit)</option>']
    .concat(units.map((u) => `<option value="${escapeHtml(u)}"${u === selected ? ' selected' : ''}>${escapeHtml(u)}</option>`))
    .join('');
}

function newCalcState() {
  return { display: '0', acc: null, op: null, overwrite: true };
}

function calcFormat(n) {
  if (!isFinite(n)) return 'Error';
  const rounded = Math.round((n + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
}

function calcApply(a, op, b) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
    default: return b;
  }
}

// Pure reducer: given the current calculator state and a key, return the next
// state. Implements standard immediate-execution calculator semantics.
function calcPress(state, key) {
  const s = {
    display: state && state.display != null ? state.display : '0',
    acc: state ? state.acc : null,
    op: state ? state.op : null,
    overwrite: state ? state.overwrite : true
  };
  if (s.display === 'Error' && key !== 'C') return s;

  if (/^[0-9]$/.test(key)) {
    s.display = (s.overwrite || s.display === '0') ? key : s.display + key;
    s.overwrite = false;
    return s;
  }
  if (key === '.') {
    if (s.overwrite) { s.display = '0.'; s.overwrite = false; }
    else if (!s.display.includes('.')) s.display += '.';
    return s;
  }
  if (key === 'C') return newCalcState();
  if (key === 'back') {
    if (!s.overwrite && s.display.length > 1) s.display = s.display.slice(0, -1);
    else { s.display = '0'; s.overwrite = true; }
    return s;
  }
  if (key === 'neg') {
    s.display = calcFormat(-Number(s.display));
    return s;
  }
  if (key === '%') {
    s.display = calcFormat(Number(s.display) / 100);
    return s;
  }
  if (key === '+' || key === '-' || key === '*' || key === '/') {
    if (s.op !== null && !s.overwrite) {
      const result = calcApply(s.acc, s.op, Number(s.display));
      if (!isFinite(result)) return newCalcStateWithError();
      s.acc = result;
      s.display = calcFormat(result);
    } else if (s.acc === null) {
      s.acc = Number(s.display);
    }
    s.op = key;
    s.overwrite = true;
    return s;
  }
  if (key === '=') {
    if (s.op !== null && s.acc !== null) {
      const result = calcApply(s.acc, s.op, Number(s.display));
      if (!isFinite(result)) return newCalcStateWithError();
      s.display = calcFormat(result);
      s.acc = null;
      s.op = null;
      s.overwrite = true;
    }
    return s;
  }
  return s;
}

function newCalcStateWithError() {
  return { display: 'Error', acc: null, op: null, overwrite: true };
}

/* ---------- Snapshots (saved stock-takes) + comparison analysis ---------- */

const SNAPSHOTS_KEY = 'hub-sky-snapshots';

function getSnapshots() {
  const raw = localStorage.getItem(SNAPSHOTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSnapshots(list) {
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(list));
}

function saveSnapshot(name, items, isoDate) {
  const snapshots = getSnapshots();
  snapshots.push({
    name: String(name || 'Snapshot').trim() || 'Snapshot',
    date: isoDate || '',
    items: items.map((item) => ({ ...item }))
  });
  persistSnapshots(snapshots);
  return snapshots;
}

function deleteSnapshot(index) {
  const snapshots = getSnapshots();
  if (index >= 0 && index < snapshots.length) {
    snapshots.splice(index, 1);
    persistSnapshots(snapshots);
  }
  return snapshots;
}

// Clears the count fields (min/par) for a fresh stock-take while keeping the
// item master (name/category/uom).
function clearedCounts(items) {
  return items.map((item) => ({ ...item, min: '', par: '' }));
}

// Extracts a comparable numeric magnitude from a free-text quantity, e.g.
// "2 Bot + 500mL" -> 2.5, "147 Grams" -> 147, "10 L" -> 10, "" -> null.
function parseQuantity(value) {
  if (value == null) return null;
  const s = String(value);
  const bot = s.match(/(\d+(?:\.\d+)?)\s*bot/i);
  const ml = s.match(/(\d+(?:\.\d+)?)\s*ml/i);
  if (bot || ml) {
    return (bot ? parseFloat(bot[1]) : 0) + (ml ? parseFloat(ml[1]) / 1000 : 0);
  }
  const num = s.match(/-?\d+(?:\.\d+)?/);
  return num ? parseFloat(num[0]) : null;
}

// Compares two inventories by item name using `field` (default 'min') as the
// count. Returns per-item change rows with percentage plus added/removed lists.
function compareInventories(beforeItems, afterItems, field) {
  const key = field || 'min';
  const norm = (n) => String(n || '').trim().toLowerCase();
  const beforeMap = new Map(beforeItems.map((i) => [norm(i.name), i]));
  const afterMap = new Map(afterItems.map((i) => [norm(i.name), i]));
  const rows = [];
  let increased = 0, decreased = 0, unchanged = 0;

  afterItems.forEach((a) => {
    const b = beforeMap.get(norm(a.name));
    if (!b) return;
    const beforeNum = parseQuantity(b[key]);
    const afterNum = parseQuantity(a[key]);
    let pct = null;
    if (beforeNum != null && afterNum != null && beforeNum !== 0) {
      pct = ((afterNum - beforeNum) / Math.abs(beforeNum)) * 100;
    } else if (beforeNum === 0 && afterNum != null && afterNum > 0) {
      pct = Infinity;
    }
    const delta = (afterNum != null && beforeNum != null) ? afterNum - beforeNum : null;
    if (delta != null) {
      if (delta > 0) increased++;
      else if (delta < 0) decreased++;
      else unchanged++;
    }
    rows.push({ name: a.name, before: b[key] || '', after: a[key] || '', beforeNum, afterNum, delta, pct });
  });

  const added = afterItems.filter((a) => !beforeMap.has(norm(a.name))).map((a) => a.name);
  const removed = beforeItems.filter((b) => !afterMap.has(norm(b.name))).map((b) => b.name);
  return { rows, added, removed, summary: { increased, decreased, unchanged, total: rows.length } };
}

function pctLabel(pct) {
  if (pct == null) return '<span class="cmp-na">n/a</span>';
  if (!isFinite(pct)) return '<span class="cmp-up">NEW</span>';
  const cls = pct > 0 ? 'cmp-up' : (pct < 0 ? 'cmp-down' : 'cmp-flat');
  const sign = pct > 0 ? '+' : '';
  return `<span class="${cls}">${sign}${pct.toFixed(1)}%</span>`;
}

// Renders the comparison result as an HTML string (shared by desktop + mobile).
function compareTableHtml(result) {
  const { rows, added, removed, summary } = result;
  const changed = rows.filter((r) => r.delta != null && r.delta !== 0);
  const body = changed.length
    ? changed.map((r) => `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.before)}</td>
        <td>${escapeHtml(r.after)}</td>
        <td>${pctLabel(r.pct)}</td>
      </tr>`).join('')
    : '<tr><td colspan="4" class="cmp-empty">No measurable changes between these counts.</td></tr>';
  return `
    <div class="cmp-summary">
      <span class="cmp-up">${summary.increased} up</span>
      <span class="cmp-down">${summary.decreased} down</span>
      <span class="cmp-flat">${summary.unchanged} same</span>
      ${added.length ? `<span class="cmp-add">${added.length} added</span>` : ''}
      ${removed.length ? `<span class="cmp-rem">${removed.length} removed</span>` : ''}
    </div>
    <table class="cmp-table">
      <thead><tr><th>Item</th><th>Before</th><th>After</th><th>Change</th></tr></thead>
      <tbody>${body}</tbody>
    </table>`;
}
