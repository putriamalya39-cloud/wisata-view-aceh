import { CATEGORIES, REGIONS } from '../data/sampleData.js';
import { store } from '../state/store.js';
import {
  $,
  escapeHtml,
  formatIdr,
  isValidOptionalHttpUrl,
  modalManager,
  showToast,
} from '../utils/dom.js';

const SCHEMAS = {
  destinations: [
    { key: 'name', label: 'Nama', required: true },
    { key: 'category', label: 'Kategori', type: 'select', options: CATEGORIES, required: true },
    { key: 'region', label: 'Wilayah', type: 'select', options: REGIONS, required: true },
    { key: 'description', label: 'Deskripsi', wide: true, required: true },
    { key: 'cost', label: 'Estimasi biaya (Rp)', type: 'number' },
    { key: 'imageUrl', label: 'URL gambar (https://)', type: 'url', wide: true },
    { key: 'address', label: 'Alamat', wide: true },
    { key: 'mapsUrl', label: 'URL Google Maps (https://)', type: 'url', wide: true },
    { key: 'facilities', label: 'Fasilitas', wide: true },
    { key: 'prayer', label: 'Fasilitas ibadah', wide: true },
    { key: 'lat', label: 'Latitude', type: 'decimal' },
    { key: 'lng', label: 'Longitude', type: 'decimal' },
  ],
  foods: [
    { key: 'name', label: 'Nama', required: true },
    { key: 'category', label: 'Kategori', required: true },
    { key: 'region', label: 'Wilayah', type: 'select', options: REGIONS, required: true },
    { key: 'price', label: 'Harga (Rp)', type: 'number' },
    { key: 'status', label: 'Status sertifikasi', required: true },
    { key: 'source', label: 'Sumber verifikasi', wide: true },
    { key: 'imageUrl', label: 'URL gambar (https://)', type: 'url', wide: true },
    { key: 'contact', label: 'Kontak simulasi' },
  ],
  stays: [
    { key: 'name', label: 'Nama', required: true },
    { key: 'region', label: 'Wilayah', type: 'select', options: REGIONS, required: true },
    { key: 'price', label: 'Harga per malam (Rp)', type: 'number' },
    { key: 'contact', label: 'Kontak simulasi' },
    { key: 'facilities', label: 'Fasilitas', wide: true },
    { key: 'muslim', label: 'Fasilitas ramah Muslim', wide: true },
    { key: 'imageUrl', label: 'URL gambar (https://)', type: 'url', wide: true },
  ],
  packages: [
    { key: 'name', label: 'Nama', required: true },
    { key: 'duration', label: 'Durasi (hari)', type: 'number', required: true },
    { key: 'cost', label: 'Estimasi biaya (Rp)', type: 'number' },
    { key: 'regions', label: 'Wilayah (pisahkan koma)', type: 'list', wide: true },
    { key: 'interests', label: 'Minat (pisahkan koma)', type: 'list', wide: true },
    { key: 'destinations', label: 'ID destinasi (pisahkan koma)', type: 'list', wide: true },
    { key: 'description', label: 'Deskripsi', wide: true, required: true },
  ],
};

export function createAdminController({ t }) {
  let activeType = 'destinations';

  function getTitleForType(type) {
    const map = {
      destinations: t('tabDest'),
      foods: t('tabFood'),
      stays: t('tabStay'),
      packages: t('tabPkg'),
    };
    return map[type] || type;
  }

  function renderTable() {
    const titleEl = $('adminTableTitle');
    const headEl = $('adminHead');
    const bodyEl = $('adminBody');
    if (!headEl || !bodyEl) return;

    if (titleEl) {
      titleEl.textContent = getTitleForType(activeType);
    }

    const schema = SCHEMAS[activeType];
    const previewCols = schema.slice(0, 3);
    const records = store.db[activeType] || [];

    headEl.innerHTML = `
      <tr>
        ${previewCols.map((col) => `<th>${escapeHtml(col.label)}</th>`).join('')}
        <th>${escapeHtml(t('costActivity').split(' ')[0])} / Info</th>
        <th>Aksi</th>
      </tr>
    `;

    bodyEl.innerHTML = records
      .map((rec) => {
        const numericVal = rec.cost ?? rec.price ?? rec.duration;
        const formattedInfo =
          activeType === 'packages' && rec.cost != null
            ? formatIdr(rec.cost)
            : numericVal != null
              ? formatIdr(numericVal)
              : '—';

        return `
          <tr>
            ${previewCols
              .map((col) => {
                const raw = rec[col.key];
                const text = Array.isArray(raw) ? raw.join(', ') : raw ?? '—';
                return `<td>${escapeHtml(text)}</td>`;
              })
              .join('')}
            <td class="tabular-nums">${escapeHtml(formattedInfo)}</td>
            <td>
              <div class="admin-row-actions">
                <button type="button" class="btn btn-secondary btn-sm" data-admin-action="edit" data-record-id="${escapeHtml(rec.id)}">${escapeHtml(t('editBtn'))}</button>
                <button type="button" class="btn btn-danger btn-sm" data-admin-action="delete" data-record-id="${escapeHtml(rec.id)}">${escapeHtml(t('deleteBtn'))}</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  function openEditor(record = null) {
    const editId = record?.id || null;
    const schema = SCHEMAS[activeType];

    const fieldsHtml = schema
      .map((field) => {
        const rawVal = record?.[field.key];
        const value = Array.isArray(rawVal) ? rawVal.join(', ') : rawVal ?? '';
        const wideClass = field.wide ? 'field-wide' : '';

        if (field.type === 'select') {
          const opts = field.options
            .map(
              (opt) =>
                `<option value="${escapeHtml(opt)}" ${value === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>`
            )
            .join('');
          return `
            <div class="field-group ${wideClass}">
              <label for="adminField-${field.key}">${escapeHtml(field.label)}</label>
              <select id="adminField-${field.key}" class="input admin-edit-field" data-key="${field.key}">
                ${opts}
              </select>
            </div>
          `;
        }

        const inputType =
          field.type === 'number'
            ? 'number'
            : field.type === 'url'
              ? 'url'
              : 'text';
        const extraAttrs =
          field.type === 'number'
            ? 'min="0" step="1"'
            : field.type === 'decimal'
              ? 'inputmode="decimal"'
              : '';

        return `
          <div class="field-group ${wideClass}">
            <label for="adminField-${field.key}">${escapeHtml(field.label)}</label>
            <input
              id="adminField-${field.key}"
              type="${inputType}"
              class="input admin-edit-field"
              data-key="${field.key}"
              value="${escapeHtml(value)}"
              ${field.required ? 'required' : ''}
              ${extraAttrs}
            />
          </div>
        `;
      })
      .join('');

    modalManager.open({
      title: editId ? `${t('editBtn')} — ${getTitleForType(activeType)}` : `${t('addRecordBtn')} — ${getTitleForType(activeType)}`,
      bodyHtml: `<form id="adminRecordForm" class="form-grid" novalidate>${fieldsHtml}</form>`,
      footerHtml: `
        <button type="button" class="btn btn-outline" data-modal-action="cancel">${escapeHtml(t('cancelBtn'))}</button>
        <button type="button" class="btn btn-primary" data-modal-action="save">${escapeHtml(t('saveBtn'))}</button>
      `,
      onMount: (body, footer) => {
        footer.querySelector('[data-modal-action="cancel"]')?.addEventListener('click', () => {
          modalManager.close();
        });

        footer.querySelector('[data-modal-action="save"]')?.addEventListener('click', () => {
          const inputs = [...body.querySelectorAll('.admin-edit-field')];
          let valid = true;
          const payload = {};

          inputs.forEach((el) => {
            const key = el.dataset.key;
            const fieldDef = schema.find((s) => s.key === key);
            const raw = el.value.trim();
            el.classList.remove('is-invalid');

            if (fieldDef?.required && !raw) {
              el.classList.add('is-invalid');
              valid = false;
            }

            if (fieldDef?.type === 'url' && !isValidOptionalHttpUrl(raw)) {
              el.classList.add('is-invalid');
              valid = false;
            }

            if (fieldDef?.type === 'number') {
              const num = Number(raw);
              if (!Number.isFinite(num) || num < 0) {
                el.classList.add('is-invalid');
                valid = false;
              }
              payload[key] = Math.max(0, num || 0);
            } else if (fieldDef?.type === 'decimal') {
              payload[key] = raw === '' ? null : Number.isFinite(Number(raw)) ? Number(raw) : null;
            } else if (fieldDef?.type === 'list') {
              payload[key] = raw
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
            } else {
              payload[key] = raw;
            }
          });

          if (!valid) {
            showToast(t('invalidFormToast'));
            return;
          }

          if (editId) {
            const index = store.db[activeType].findIndex((item) => item.id === editId);
            if (index >= 0) {
              store.db[activeType][index] = {
                ...store.db[activeType][index],
                ...payload,
              };
            }
          } else {
            store.db[activeType].push({
              ...payload,
              id: `${activeType.slice(0, 1)}${Date.now()}`,
            });
          }

          store.saveDb();
          modalManager.close();
          showToast(t('recordSavedToast'));
        });
      },
    });
  }

  function exportCatalogJson() {
    const blob = new Blob([JSON.stringify(store.db, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wisata-view-aceh-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(t('exportedToast'));
  }

  function init() {
    $('adminTabs')?.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-type]');
      if (!tab) return;
      activeType = tab.dataset.type;
      document.querySelectorAll('#adminTabs .tab').forEach((btn) => {
        const isCurrent = btn === tab;
        btn.classList.toggle('is-active', isCurrent);
        btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });
      renderTable();
    });

    $('addRecord')?.addEventListener('click', () => openEditor(null));
    $('exportDataBtn')?.addEventListener('click', exportCatalogJson);

    $('resetData')?.addEventListener('click', async () => {
      const confirmed = await modalManager.confirm({
        title: t('confirmRestoreTitle'),
        message: t('confirmRestoreMsg'),
        confirmLabel: t('restoreSampleBtn'),
        cancelLabel: t('cancelBtn'),
        danger: true,
      });
      if (!confirmed) return;
      store.restoreSampleDb();
      showToast(t('restoredToast'));
    });

    $('adminBody')?.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-admin-action]');
      if (!btn) return;
      const recordId = btn.dataset.recordId;
      const action = btn.dataset.adminAction;

      if (action === 'edit') {
        const record = store.db[activeType].find((item) => item.id === recordId);
        if (record) openEditor(record);
      } else if (action === 'delete') {
        const confirmed = await modalManager.confirm({
          title: t('confirmDeleteTitle'),
          message: t('confirmDeleteMsg'),
          confirmLabel: t('deleteBtn'),
          cancelLabel: t('cancelBtn'),
          danger: true,
        });
        if (!confirmed) return;
        store.db[activeType] = store.db[activeType].filter((item) => item.id !== recordId);
        store.saveDb();
        showToast(t('recordDeletedToast'));
      }
    });

    renderTable();
  }

  return { init, render: renderTable };
}
