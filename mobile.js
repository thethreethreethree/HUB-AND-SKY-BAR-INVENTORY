// Mobile controller. Shares constants, data helpers, parsing and OCR with the
// desktop app via inventory-core.js (loaded before this file). Reads and writes
// the same localStorage key, so desktop and mobile stay in sync.

const el = {
  cardList: document.querySelector('#card-list'),
  count: document.querySelector('#inventory-count'),
  search: document.querySelector('#search-input'),
  category: document.querySelector('#category-filter'),
  fabAdd: document.querySelector('#fab-add'),

  itemSheet: document.querySelector('#item-sheet'),
  sheetTitle: document.querySelector('#sheet-title'),
  itemForm: document.querySelector('#item-form'),
  itemName: document.querySelector('#item-name'),
  itemCategory: document.querySelector('#item-category'),
  itemUom: document.querySelector('#item-uom'),
  itemMin: document.querySelector('#item-min'),
  itemPar: document.querySelector('#item-par'),
  itemIndex: document.querySelector('#item-index'),
  sheetCancel: document.querySelector('#sheet-cancel'),

  fabCam: document.querySelector('#cam-fab'),

  menuButton: document.querySelector('#menu-button'),
  menuSheet: document.querySelector('#menu-sheet'),
  menuClose: document.querySelector('#menu-close'),
  addItem: document.querySelector('#add-item'),
  openCalc: document.querySelector('#open-calc'),
  saveSnapshotBtn: document.querySelector('#save-snapshot'),
  startNew: document.querySelector('#start-new'),
  openAnalysis: document.querySelector('#open-analysis'),
  camInput: document.querySelector('#cam-input'),
  ocrUpload: document.querySelector('#ocr-upload'),
  loadSample: document.querySelector('#load-sample'),
  exportCsv: document.querySelector('#export-csv'),
  exportJson: document.querySelector('#export-json'),
  importCsv: document.querySelector('#import-csv'),
  importJson: document.querySelector('#import-json'),
  logoutButton: document.querySelector('#logout-button'),

  analysisSheet: document.querySelector('#analysis-sheet'),
  analysisClose: document.querySelector('#analysis-close'),
  compareSelect: document.querySelector('#compare-select'),
  compareRun: document.querySelector('#compare-run'),
  compareResults: document.querySelector('#compare-results'),
  snapshotList: document.querySelector('#snapshot-list'),

  calcSheet: document.querySelector('#calc-sheet'),
  calcDisplay: document.querySelector('#calc-display'),
  calcKeys: document.querySelector('#calc-keys'),
  calcInsert: document.querySelector('#calc-insert'),
  calcClose: document.querySelector('#calc-close'),
  calcTargetNote: document.querySelector('#calc-target-note'),
  calcUnit: document.querySelector('#calc-unit'),
  calcUnitRow: document.querySelector('#calc-unit-row'),

  ocrOverlay: document.querySelector('#ocr-overlay'),
  ocrStatus: document.querySelector('#ocr-status'),

  loginModal: document.querySelector('#login-modal'),
  loginForm: document.querySelector('#login-form'),
  loginPassword: document.querySelector('#login-password')
};

let inventory = [];
let filterState = { search: '', category: 'all' };

function loadInventory() {
  inventory = getInitialInventory();
  renderCards();
}

function saveInventory() {
  persistInventory(inventory);
  renderCards();
}

function getVisibleRows() {
  let rows = inventory.map((item, index) => ({ item, index }));
  const search = filterState.search.trim().toLowerCase();
  if (search) {
    rows = rows.filter(({ item }) =>
      [item.name, item.category, item.uom, item.min, item.par].some((value) =>
        String(value || '').toLowerCase().includes(search)));
  }
  if (filterState.category !== 'all') {
    rows = rows.filter(({ item }) => (item.category || '').trim() === filterState.category);
  }
  return rows;
}

function refreshCategoryFilter() {
  const categories = Array.from(new Set(inventory.map((item) => (item.category || '').trim()).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
  if (!categories.includes(filterState.category)) filterState.category = 'all';
  el.category.innerHTML = '<option value="all">All categories</option>' +
    categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
  el.category.value = filterState.category;
}

function renderCards() {
  refreshCategoryFilter();
  const rows = getVisibleRows();
  if (rows.length) {
    el.cardList.innerHTML = rows.map(({ item, index }) => cardTemplate(item, index)).join('');
  } else {
    el.cardList.innerHTML = `<p class="m-empty">${inventory.length ? 'No items match your search.' : 'No items yet. Tap + to add one.'}</p>`;
  }
  const total = inventory.length;
  el.count.textContent = rows.length === total ? `${total} items` : `${rows.length} of ${total} items`;
}

function field(label, value) {
  return value ? `<div class="m-field"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>` : '';
}

function cardTemplate(item, index) {
  return `
    <article class="m-card" data-index="${index}">
      <div class="m-card-top">
        <h3>${escapeHtml(item.name)}</h3>
        <span class="m-badge">${escapeHtml(item.category || '-')}</span>
      </div>
      <div class="m-card-fields">
        ${field('UOM', item.uom)}
        ${field('Min on hand', item.min)}
        ${field('Par', item.par)}
      </div>
      <div class="m-card-actions">
        <button type="button" class="m-btn m-btn-ghost" data-action="edit" data-index="${index}">Edit</button>
        <button type="button" class="m-btn m-btn-danger" data-action="delete" data-index="${index}">Delete</button>
      </div>
    </article>`;
}

function handleCardClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const index = Number(button.dataset.index);
  if (button.dataset.action === 'edit') {
    openEdit(index);
  } else if (button.dataset.action === 'delete') {
    if (confirm('Remove this item?')) {
      inventory.splice(index, 1);
      saveInventory();
    }
  }
}

/* Add / edit sheet */
function openSheet(sheet) {
  sheet.classList.remove('hidden');
  document.body.classList.add('m-no-scroll');
}

function closeSheet(sheet) {
  sheet.classList.add('hidden');
  document.body.classList.remove('m-no-scroll');
}

function openAdd() {
  closeSheet(el.menuSheet);
  el.itemForm.reset();
  el.itemIndex.value = '-1';
  el.sheetTitle.textContent = 'Add item';
  openSheet(el.itemSheet);
  el.itemName.focus();
}

function openEdit(index) {
  const item = inventory[index];
  if (!item) return;
  el.itemName.value = item.name;
  el.itemCategory.value = item.category;
  el.itemUom.value = item.uom;
  el.itemMin.value = item.min;
  el.itemPar.value = item.par;
  el.itemIndex.value = String(index);
  el.sheetTitle.textContent = 'Edit item';
  openSheet(el.itemSheet);
}

function handleSaveItem(event) {
  event.preventDefault();
  const item = normalizeItem({
    name: el.itemName.value,
    category: el.itemCategory.value,
    uom: el.itemUom.value,
    min: el.itemMin.value,
    par: el.itemPar.value
  });
  if (!item.name) {
    alert('Please enter an item name.');
    return;
  }
  const index = Number(el.itemIndex.value);
  if (index >= 0) {
    inventory[index] = item;
  } else {
    inventory.push(item);
  }
  saveInventory();
  closeSheet(el.itemSheet);
}

/* Menu actions */
function pickFile(accept, onFile) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) onFile(file);
  });
  input.click();
}

function handleExportCsv() {
  closeSheet(el.menuSheet);
  downloadBlob(convertToCsv(inventory), 'hub-sky-inventory.csv', 'text/csv;charset=utf-8');
}

function handleExportJson() {
  closeSheet(el.menuSheet);
  downloadBlob(JSON.stringify(inventory, null, 2), 'hub-sky-inventory.json', 'application/json');
}

function handleImportCsv() {
  closeSheet(el.menuSheet);
  pickFile('.csv,text/csv', async (file) => {
    const imported = parseCsvText(await file.text());
    if (imported.length) {
      inventory = [...inventory, ...imported];
      saveInventory();
      alert(`Imported ${imported.length} rows from CSV.`);
    } else {
      alert('No rows were imported from the selected file.');
    }
  });
}

function handleImportJson() {
  closeSheet(el.menuSheet);
  pickFile('.json,application/json', async (file) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (Array.isArray(parsed)) {
        inventory = [...inventory, ...parsed.map(normalizeItem)];
        saveInventory();
        alert(`Imported ${parsed.length} records from JSON.`);
      } else {
        alert('JSON file must contain an array of inventory objects.');
      }
    } catch (error) {
      alert('Unable to parse JSON file.');
    }
  });
}

function handleLoadSample() {
  if (inventory.length && !confirm(`Replace the current ${inventory.length} item(s) with the full sample list (${defaultInventory.length} items)? This overwrites the current list.`)) {
    return;
  }
  inventory = defaultInventory.map((item) => ({ ...item }));
  saveInventory();
  closeSheet(el.menuSheet);
  alert(`Loaded ${inventory.length} items. Review and edit the handwritten counts as needed.`);
}

/* Camera / photo OCR */
async function handleOcrFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  closeSheet(el.menuSheet);
  el.ocrStatus.textContent = 'Scanning image...';
  el.ocrOverlay.classList.remove('hidden');
  try {
    const parsed = await runOcr(file);
    if (parsed.length) {
      inventory = [...inventory, ...parsed];
      saveInventory();
      alert(`Scanned ${parsed.length} items. Printed text reads best - review the handwritten counts.`);
    } else {
      alert('No inventory rows were recognized. Handwriting scans poorly - add items manually or import a CSV.');
    }
  } catch (error) {
    console.error(error);
    alert('Scan failed. Try a clearer, well-lit photo or import a CSV.');
  } finally {
    el.ocrOverlay.classList.add('hidden');
    event.target.value = '';
  }
}

/* Login */
function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

function handleLogin(event) {
  event.preventDefault();
  const attempt = el.loginPassword.value.trim();
  if (!attempt) return;
  if (attempt === PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    el.loginModal.classList.add('hidden');
    document.body.classList.remove('m-no-scroll');
    loadInventory();
    el.loginPassword.value = '';
  } else {
    alert('Password incorrect. Please try again.');
  }
}

function handleLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  closeSheet(el.menuSheet);
  openSheet(el.loginModal);
}

/* Calculator */
let calcState = newCalcState();
let calcTargetInput = null;

function fieldLabelText(input) {
  const label = input.closest('label');
  return (label && label.childNodes[0] ? label.childNodes[0].textContent.trim() : '') || 'field';
}

function renderCalc() {
  el.calcDisplay.textContent = calcState.display;
}

function openCalculator(targetInput) {
  calcTargetInput = targetInput || null;
  calcState = newCalcState();
  if (calcTargetInput) {
    const value = calcTargetInput.value.trim();
    if (value && String(Number(value)) === value) {
      calcState = { display: value, acc: null, op: null, overwrite: true };
    }
    el.calcTargetNote.textContent = `Insert into "${fieldLabelText(calcTargetInput)}"`;
    el.calcInsert.style.display = '';
    el.calcUnit.innerHTML = calcUnitOptionsHtml(defaultUnitForUom(el.itemUom.value));
    el.calcUnitRow.classList.remove('hidden');
  } else {
    el.calcTargetNote.textContent = 'Scratch pad';
    el.calcInsert.style.display = 'none';
    el.calcUnitRow.classList.add('hidden');
  }
  renderCalc();
  openSheet(el.calcSheet);
}

function closeCalculator() {
  el.calcSheet.classList.add('hidden');
  calcTargetInput = null;
  const anyOpen = !el.itemSheet.classList.contains('hidden') ||
    !el.menuSheet.classList.contains('hidden') ||
    !el.loginModal.classList.contains('hidden');
  document.body.classList.toggle('m-no-scroll', anyOpen);
}

function handleCalcKey(event) {
  const button = event.target.closest('button[data-key]');
  if (!button) return;
  calcState = calcPress(calcState, button.dataset.key);
  renderCalc();
}

function insertCalcResult() {
  if (calcTargetInput && calcState.display !== 'Error') {
    const unit = el.calcUnit.value;
    calcTargetInput.value = unit ? `${calcState.display} ${unit}` : calcState.display;
    calcTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  closeCalculator();
}

/* Snapshots & analysis */
function formatSnapDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function handleSaveSnapshot() {
  closeSheet(el.menuSheet);
  if (!inventory.length) {
    alert('Nothing to save yet. Add or load items first.');
    return;
  }
  const stamp = new Date();
  const name = prompt('Name this snapshot:', 'Snapshot ' + stamp.toLocaleString());
  if (name === null) return;
  saveSnapshot(name, inventory, stamp.toISOString());
  alert(`Snapshot saved. You now have ${getSnapshots().length} saved snapshot(s).`);
}

function handleStartNew() {
  closeSheet(el.menuSheet);
  if (!inventory.length) {
    alert('There is nothing to clear yet.');
    return;
  }
  if (!confirm(`Start a new inventory?\n\nThis saves the current counts as a snapshot, then clears Min on hand and Par for all ${inventory.length} items so you can enter fresh counts.`)) {
    return;
  }
  const stamp = new Date();
  saveSnapshot('Stock-take ' + stamp.toLocaleString(), inventory, stamp.toISOString());
  inventory = clearedCounts(inventory);
  saveInventory();
  alert('Saved a snapshot and cleared the counts. Enter your new counts, then use Compare to see the % change.');
}

function renderSnapshotControls() {
  const snaps = getSnapshots();
  el.compareSelect.innerHTML = snaps.length
    ? snaps.map((s, i) => `<option value="${i}">${escapeHtml(s.name)}</option>`).join('')
    : '<option value="">No snapshots saved yet</option>';
  el.snapshotList.innerHTML = snaps.length
    ? snaps.map((s, i) => `
      <div class="snap-row">
        <div class="snap-meta">
          <strong>${escapeHtml(s.name)}</strong>
          <span>${escapeHtml(formatSnapDate(s.date))} &middot; ${s.items.length} items</span>
        </div>
        <div class="snap-actions">
          <button type="button" class="m-btn m-btn-ghost" data-snap-action="restore" data-index="${i}">Restore</button>
          <button type="button" class="m-btn m-btn-danger" data-snap-action="delete" data-index="${i}">Delete</button>
        </div>
      </div>`).join('')
    : '<p class="cmp-empty">No snapshots saved yet. Use "Save snapshot" or "Start new inventory".</p>';
}

function openAnalysis() {
  closeSheet(el.menuSheet);
  renderSnapshotControls();
  el.compareResults.innerHTML = '';
  openSheet(el.analysisSheet);
}

function handleCompareRun() {
  const snaps = getSnapshots();
  const idx = Number(el.compareSelect.value);
  if (!snaps.length || Number.isNaN(idx) || !snaps[idx]) {
    alert('Save a snapshot first to compare against.');
    return;
  }
  const result = compareInventories(snaps[idx].items, inventory, 'min');
  el.compareResults.innerHTML =
    `<p class="cmp-caption">Comparing <strong>${escapeHtml(snaps[idx].name)}</strong> (before) vs current counts (after).</p>` +
    compareTableHtml(result);
}

function handleSnapshotListClick(event) {
  const button = event.target.closest('button[data-snap-action]');
  if (!button) return;
  const idx = Number(button.dataset.index);
  const snaps = getSnapshots();
  if (!snaps[idx]) return;
  if (button.dataset.snapAction === 'restore') {
    if (confirm(`Restore "${snaps[idx].name}"? This replaces the current inventory.`)) {
      inventory = snaps[idx].items.map((item) => ({ ...item }));
      saveInventory();
      closeSheet(el.analysisSheet);
    }
  } else if (button.dataset.snapAction === 'delete') {
    if (confirm(`Delete snapshot "${snaps[idx].name}"?`)) {
      deleteSnapshot(idx);
      renderSnapshotControls();
    }
  }
}

function attachEvents() {
  el.search.addEventListener('input', (event) => {
    filterState.search = event.target.value;
    renderCards();
  });
  el.category.addEventListener('change', (event) => {
    filterState.category = event.target.value;
    renderCards();
  });
  el.fabAdd.addEventListener('click', openAdd);
  el.addItem.addEventListener('click', openAdd);
  el.cardList.addEventListener('click', handleCardClick);

  el.itemForm.addEventListener('submit', handleSaveItem);
  el.sheetCancel.addEventListener('click', () => closeSheet(el.itemSheet));
  el.itemSheet.addEventListener('click', (event) => {
    if (event.target === el.itemSheet) closeSheet(el.itemSheet);
  });
  el.itemSheet.addEventListener('click', (event) => {
    const trigger = event.target.closest('.calc-trigger');
    if (trigger) openCalculator(document.querySelector('#' + trigger.dataset.calcTarget));
  });

  el.fabCam.addEventListener('click', () => el.camInput.click());
  el.openCalc.addEventListener('click', () => { closeSheet(el.menuSheet); openCalculator(null); });
  el.calcKeys.addEventListener('click', handleCalcKey);
  el.calcInsert.addEventListener('click', insertCalcResult);
  el.calcClose.addEventListener('click', closeCalculator);
  el.calcSheet.addEventListener('click', (event) => {
    if (event.target === el.calcSheet) closeCalculator();
  });

  el.menuButton.addEventListener('click', () => openSheet(el.menuSheet));
  el.menuClose.addEventListener('click', () => closeSheet(el.menuSheet));
  el.menuSheet.addEventListener('click', (event) => {
    if (event.target === el.menuSheet) closeSheet(el.menuSheet);
  });

  el.camInput.addEventListener('change', handleOcrFile);
  el.ocrUpload.addEventListener('change', handleOcrFile);
  el.loadSample.addEventListener('click', handleLoadSample);
  el.exportCsv.addEventListener('click', handleExportCsv);
  el.exportJson.addEventListener('click', handleExportJson);
  el.importCsv.addEventListener('click', handleImportCsv);
  el.importJson.addEventListener('click', handleImportJson);
  el.logoutButton.addEventListener('click', handleLogout);

  el.saveSnapshotBtn.addEventListener('click', handleSaveSnapshot);
  el.startNew.addEventListener('click', handleStartNew);
  el.openAnalysis.addEventListener('click', openAnalysis);
  el.analysisClose.addEventListener('click', () => closeSheet(el.analysisSheet));
  el.compareRun.addEventListener('click', handleCompareRun);
  el.snapshotList.addEventListener('click', handleSnapshotListClick);
  el.analysisSheet.addEventListener('click', (event) => {
    if (event.target === el.analysisSheet) closeSheet(el.analysisSheet);
  });

  el.loginForm.addEventListener('submit', handleLogin);
}

function initApp() {
  el.calcKeys.innerHTML = calcKeypadHtml();
  attachEvents();
  if (!isLoggedIn()) {
    openSheet(el.loginModal);
  } else {
    loadInventory();
  }
}

initApp();
