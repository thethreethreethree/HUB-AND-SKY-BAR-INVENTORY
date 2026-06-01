// Constants (STORAGE_KEY, SESSION_KEY, PASSWORD, defaultInventory) and shared
// data helpers live in inventory-core.js, which loads before this file.

const elements = {
  inventoryTable: document.querySelector('#inventory-table tbody'),
  inventoryCount: document.querySelector('#inventory-count'),
  loginModal: document.querySelector('#login-modal'),
  loginForm: document.querySelector('#login-form'),
  loginPassword: document.querySelector('#login-password'),
  logoutButton: document.querySelector('#logout-button'),
  openAddButton: document.querySelector('#open-add-button'),
  cancelAdd: document.querySelector('#cancel-add'),
  addModal: document.querySelector('#add-modal'),
  addPanelTitle: document.querySelector('#add-panel-title'),
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
  addFromList: document.querySelector('#add-from-list'),
  loadSample: document.querySelector('#load-sample'),
  inventoryHead: document.querySelector('#inventory-table thead')
};

let inventory = [];
let filterState = { search: '', category: 'all', sortKey: '', sortDir: 'asc' };

function saveInventory() {
  persistInventory(inventory);
  renderInventory();
}

function loadInventory() {
  inventory = getInitialInventory();
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

function handleLoadSample() {
  if (inventory.length && !confirm(`Replace the current ${inventory.length} item(s) with the full sample inventory (${defaultInventory.length} items)? This overwrites the current list.`)) {
    return;
  }
  inventory = defaultInventory.map((item) => ({ ...item }));
  saveInventory();
  alert(`Loaded ${inventory.length} items. Review and edit the handwritten counts as needed.`);
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
  elements.addModal.classList.toggle('hidden', !show);
  document.body.classList.toggle('modal-open', show);
}

function resetForm() {
  elements.itemForm.reset();
  elements.itemIndex.value = '-1';
}

function handleOpenAdd() {
  resetForm();
  elements.addPanelTitle.textContent = 'Add item';
  toggleAddPanel(true);
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
  elements.addPanelTitle.textContent = 'Edit item';
  elements.itemName.value = item.name;
  elements.itemCategory.value = item.category;
  elements.itemUom.value = item.uom;
  elements.itemMin.value = item.min;
  elements.itemPar.value = item.par;
  elements.itemIndex.value = String(index);
  toggleAddPanel(true);
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

async function handleOcrFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const button = event.target.closest('.file-label');
  const originalLabel = button ? button.firstChild.textContent : '';
  if (button) button.firstChild.textContent = ' Scanning image\u2026 ';
  try {
    const parsed = await runOcr(file);
    if (parsed.length) {
      inventory = [...inventory, ...parsed];
      saveInventory();
      alert(`OCR imported ${parsed.length} items. Printed text reads best; review the handwritten counts.`);
    } else {
      alert('OCR completed but no inventory rows were recognized. Handwritten columns scan poorly \u2014 try a printed list or use CSV import.');
    }
  } catch (error) {
    console.error(error);
    alert('OCR failed. Please try a clearer image or use CSV import.');
  } finally {
    if (button) button.firstChild.textContent = originalLabel;
    event.target.value = '';
  }
}

function attachEvents() {
  elements.loginForm.addEventListener('submit', handleLogin);
  elements.logoutButton.addEventListener('click', handleLogout);
  elements.openAddButton.addEventListener('click', handleOpenAdd);
  elements.cancelAdd.addEventListener('click', handleCancelAdd);
  elements.addModal.addEventListener('click', (event) => {
    if (event.target === elements.addModal) handleCancelAdd();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !elements.addModal.classList.contains('hidden')) handleCancelAdd();
  });
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
  elements.addFromList.addEventListener('click', handleOpenAdd);
  elements.loadSample.addEventListener('click', handleLoadSample);
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
