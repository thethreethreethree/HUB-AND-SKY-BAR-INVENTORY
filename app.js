const STORAGE_KEY = 'hub-sky-inventory-v1';
const SESSION_KEY = 'hub-sky-session';
const PASSWORD = 'hubandsky'; // default password for the local app

const defaultInventory = [
  { name: 'ABSOLUT VODKA (1000ml)', category: 'BAR', uom: 'L', min: '1 Bot + 760mL', par: '' },
  { name: 'AMARETTO LIQUEUR (750ml)', category: 'BAR', uom: 'KG', min: '147 grams', par: '' },
  { name: 'BACARDI SUPERIOR (750ml)', category: 'BAR', uom: 'ML', min: '2 Bot + 500mL', par: '' },
  { name: 'BOMBSAY SAPPHIRE (750ml)', category: 'BAR', uom: 'ML', min: '3 Bot + 240mL', par: '' },
  { name: 'BOTTLED WATER (1000ml)', category: 'BAR', uom: 'EA', min: '12? Bot', par: '' },
  { name: 'MANGO', category: 'Fruits', uom: 'EA', min: 'mixer', par: 'orange' }
];

const elements = {
  inventoryTable: document.querySelector('#inventory-table tbody'),
  inventoryCount: document.querySelector('#inventory-count'),
  loginModal: document.querySelector('#login-modal'),
  loginForm: document.querySelector('#login-form'),
  loginPassword: document.querySelector('#login-password'),
  logoutButton: document.querySelector('#logout-button'),
  openAddButton: document.querySelector('#open-add-button'),
  cancelAdd: document.querySelector('#cancel-add'),
  itemForm: document.querySelector('#item-form'),
  itemName: document.querySelector('#item-name'),
  itemCategory: document.querySelector('#item-category'),
  itemUom: document.querySelector('#item-uom'),
  itemMin: document.querySelector('#item-min'),
  itemPar: document.querySelector('#item-par'),
  itemIndex: document.querySelector('#item-index'),
  exportCsv: document.querySelector('#export-csv'),
  exportJson: document.querySelector('#export-json'),
  importCsvButton: document.querySelector('#import-csv-button'),
  importJsonButton: document.querySelector('#import-json-button'),
  ocrFile: document.querySelector('#ocr-file'),
  pasteCsv: document.querySelector('#paste-csv'),
  pasteJson: document.querySelector('#paste-json'),
  csvPaste: document.querySelector('#csv-paste'),
  jsonPaste: document.querySelector('#json-paste'),
  searchInput: document.querySelector('#search-input'),
  categoryFilter: document.querySelector('#category-filter'),
  clearFilters: document.querySelector('#clear-filters'),
  inventoryHead: document.querySelector('#inventory-table thead')
};

let inventory = [];
let filterState = { search: '', category: 'all', sortKey: '', sortDir: 'asc' };

function getStoredInventory() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveInventory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
  renderInventory();
}

function loadInventory() {
  const stored = getStoredInventory();
  inventory = Array.isArray(stored) ? stored : defaultInventory.slice();
  renderInventory();
}

function renderInventory() {
  refreshCategoryFilter();
  const rows = getVisibleRows();
  if (rows.length) {
    elements.inventoryTable.innerHTML = rows.map(({ item, index }) => createTableRow(item, index)).join('');
  } else {
    const message = inventory.length ? 'No items match your filters.' : 'No inventory items yet. Add one to get started.';
    elements.inventoryTable.innerHTML = `<tr class="empty-row"><td colspan="6">${message}</td></tr>`;
  }
  const total = inventory.length;
  const shown = rows.length;
  elements.inventoryCount.textContent = shown === total ? `${total} items` : `${shown} of ${total} items`;
  applySortIndicators();
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
  if (filterState.sortKey) {
    const direction = filterState.sortDir === 'desc' ? -1 : 1;
    rows.sort((a, b) => {
      const av = String(a.item[filterState.sortKey] || '');
      const bv = String(b.item[filterState.sortKey] || '');
      return av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' }) * direction;
    });
  }
  return rows;
}

function refreshCategoryFilter() {
  const select = elements.categoryFilter;
  if (!select) return;
  const categories = Array.from(new Set(inventory.map((item) => (item.category || '').trim()).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
  if (!categories.includes(filterState.category)) {
    filterState.category = 'all';
  }
  select.innerHTML = '<option value="all">All categories</option>' +
    categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
  select.value = filterState.category;
}

function applySortIndicators() {
  if (!elements.inventoryHead) return;
  elements.inventoryHead.querySelectorAll('th.sortable').forEach((th) => {
    const indicator = th.querySelector('.sort-indicator');
    if (th.dataset.sort === filterState.sortKey) {
      th.classList.add('sort-active');
      if (indicator) indicator.textContent = filterState.sortDir === 'asc' ? '▲' : '▼';
    } else {
      th.classList.remove('sort-active');
      if (indicator) indicator.textContent = '';
    }
  });
}

function handleSearchInput(event) {
  filterState.search = event.target.value;
  renderInventory();
}

function handleCategoryChange(event) {
  filterState.category = event.target.value;
  renderInventory();
}

function handleClearFilters() {
  filterState = { search: '', category: 'all', sortKey: '', sortDir: 'asc' };
  if (elements.searchInput) elements.searchInput.value = '';
  if (elements.categoryFilter) elements.categoryFilter.value = 'all';
  renderInventory();
}

function handleSortClick(event) {
  const th = event.target.closest('th.sortable');
  if (!th) return;
  const key = th.dataset.sort;
  if (filterState.sortKey === key) {
    filterState.sortDir = filterState.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    filterState.sortKey = key;
    filterState.sortDir = 'asc';
  }
  renderInventory();
}

function createTableRow(item, index) {
  return `
    <tr data-index="${index}">
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.category)}</td>
      <td>${escapeHtml(item.uom)}</td>
      <td>${escapeHtml(item.min)}</td>
      <td>${escapeHtml(item.par)}</td>
      <td>
        <button type="button" class="button button-secondary row-action" data-action="edit" data-index="${index}">Edit</button>
        <button type="button" class="button button-ghost row-action" data-action="delete" data-index="${index}">Delete</button>
      </td>
    </tr>`;
}

function escapeHtml(value) {
  return value ? String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])) : '';
}

function openLogin() {
  elements.loginModal.classList.remove('hidden');
}

function closeLogin() {
  elements.loginModal.classList.add('hidden');
}

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

function requireLogin() {
  if (!isLoggedIn()) openLogin();
}

function handleLogin(event) {
  event.preventDefault();
  const attempt = elements.loginPassword.value.trim();
  if (!attempt) return;
  if (attempt === PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    closeLogin();
    loadInventory();
    elements.loginPassword.value = '';
  } else {
    alert('Password incorrect. Please try again.');
  }
}

function handleLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  openLogin();
}

function toggleAddPanel(show) {
  document.querySelector('#add-panel').style.display = show ? 'block' : 'none';
}

function resetForm() {
  elements.itemForm.reset();
  elements.itemIndex.value = '-1';
}

function handleOpenAdd() {
  toggleAddPanel(true);
  resetForm();
  elements.itemName.focus();
}

function handleCancelAdd() {
  toggleAddPanel(false);
  resetForm();
}

function handleSaveItem(event) {
  event.preventDefault();
  const item = {
    name: elements.itemName.value.trim(),
    category: elements.itemCategory.value.trim() || 'BAR',
    uom: elements.itemUom.value.trim().toUpperCase() || 'EA',
    min: elements.itemMin.value.trim(),
    par: elements.itemPar.value.trim()
  };
  if (!item.name) {
    alert('Please enter an item name.');
    return;
  }
  const index = Number(elements.itemIndex.value);
  if (index >= 0) {
    inventory[index] = item;
  } else {
    inventory.push(item);
  }
  saveInventory();
  handleCancelAdd();
}

function handleTableClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const index = Number(button.dataset.index);
  if (action === 'edit') {
    openEditItem(index);
  } else if (action === 'delete') {
    if (confirm('Remove this inventory item?')) {
      inventory.splice(index, 1);
      saveInventory();
    }
  }
}

function openEditItem(index) {
  const item = inventory[index];
  if (!item) return;
  toggleAddPanel(true);
  elements.itemName.value = item.name;
  elements.itemCategory.value = item.category;
  elements.itemUom.value = item.uom;
  elements.itemMin.value = item.min;
  elements.itemPar.value = item.par;
  elements.itemIndex.value = String(index);
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

function convertToCsv(records) {
  const header = ['Name', 'Category', 'UOM', 'MinOnHand', 'Par'];
  const rows = records.map((item) => [item.name, item.category, item.uom, item.min, item.par].map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(','));
  return [header.join(','), ...rows].join('\n');
}

function handleExportCsv() {
  downloadBlob(convertToCsv(inventory), 'hub-sky-inventory.csv', 'text/csv;charset=utf-8');
}

function handleExportJson() {
  downloadBlob(JSON.stringify(inventory, null, 2), 'hub-sky-inventory.json', 'application/json');
}

function handleImportCsvClick() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,text/csv';
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const text = await file.text();
    const imported = parseCsvText(text);
    if (imported.length) {
      inventory = [...inventory, ...imported];
      saveInventory();
      alert(`Imported ${imported.length} rows from CSV.`);
    } else {
      alert('No rows were imported from the selected file.');
    }
  });
  input.click();
}

function handleImportJsonClick() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
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
  input.click();
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

function handlePasteCsv() {
  const text = elements.csvPaste.value.trim();
  if (!text) return alert('Paste CSV text first.');
  const imported = parseCsvText(text);
  inventory = [...inventory, ...imported];
  saveInventory();
  alert(`Imported ${imported.length} lines.`);
}

function handlePasteJson() {
  const text = elements.jsonPaste.value.trim();
  if (!text) return alert('Paste JSON text first.');
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('JSON must be array');
    inventory = [...inventory, ...parsed.map(normalizeItem)];
    saveInventory();
    alert(`Imported ${parsed.length} items.`);
  } catch {
    alert('Paste valid JSON array format.');
  }
}

function parseOcrLines(rawText) {
  const cleaned = rawText.replace(/\u00A0/g, ' ').replace(/\s*\|\s*/g, ' ').trim();
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

async function handleOcrFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const worker = Tesseract.createWorker({ logger: (m) => console.log(m) });
  try {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(file);
    const parsed = parseOcrLines(text);
    if (parsed.length) {
      inventory = [...inventory, ...parsed];
      saveInventory();
      alert(`OCR imported ${parsed.length} items. Review and edit any results.`);
    } else {
      alert('OCR completed but no inventory rows were recognized. Check the image and try again.');
    }
  } catch (error) {
    console.error(error);
    alert('OCR failed. Please try a clearer image or use CSV import.');
  } finally {
    await worker.terminate();
  }
}

function attachEvents() {
  elements.loginForm.addEventListener('submit', handleLogin);
  elements.logoutButton.addEventListener('click', handleLogout);
  elements.openAddButton.addEventListener('click', handleOpenAdd);
  elements.cancelAdd.addEventListener('click', handleCancelAdd);
  elements.itemForm.addEventListener('submit', handleSaveItem);
  elements.inventoryTable.parentElement.addEventListener('click', handleTableClick);
  elements.exportCsv.addEventListener('click', handleExportCsv);
  elements.exportJson.addEventListener('click', handleExportJson);
  elements.importCsvButton.addEventListener('click', handleImportCsvClick);
  elements.importJsonButton.addEventListener('click', handleImportJsonClick);
  elements.ocrFile.addEventListener('change', handleOcrFile);
  elements.pasteCsv.addEventListener('click', handlePasteCsv);
  elements.pasteJson.addEventListener('click', handlePasteJson);
  elements.searchInput.addEventListener('input', handleSearchInput);
  elements.categoryFilter.addEventListener('change', handleCategoryChange);
  elements.clearFilters.addEventListener('click', handleClearFilters);
  elements.inventoryHead.addEventListener('click', handleSortClick);
}

function initApp() {
  toggleAddPanel(false);
  attachEvents();
  if (!isLoggedIn()) {
    openLogin();
  } else {
    loadInventory();
  }
}

initApp();
