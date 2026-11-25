import { store } from '../state/store.js';
import { $, escapeHtml, formatIdr, modalManager, showToast } from '../utils/dom.js';

export function createPlannerController({ t }) {
  let daySelections = [];

  function readCurrentSelections() {
    const selects = [...document.querySelectorAll('.day-dest-select')];
    const notes = [...document.querySelectorAll('.day-note-input')];
    daySelections = selects.map((sel, index) => ({
      destinationId: sel.value,
      note: notes[index]?.value || '',
    }));
  }

  function renderDayInputs(preserveExisting = true) {
    if (preserveExisting && document.querySelectorAll('.day-dest-select').length) {
      readCurrentSelections();
    }

    const days = Math.min(5, Math.max(1, Number($('tripDays')?.value || 3)));
    const container = $('dayActivities');
    if (!container) return;

    const optionsHtml = store.db.destinations
      .map(
        (d) =>
          `<option value="${escapeHtml(d.id)}">${escapeHtml(d.name)} — ${escapeHtml(d.region)} (${
            d.cost === 0 ? escapeHtml(t('freeLabel')) : escapeHtml(formatIdr(d.cost))
          })</option>`
      )
      .join('');

    container.innerHTML = Array.from({ length: days }, (_, index) => {
      const current = daySelections[index] || { destinationId: '', note: '' };
      const destObj = store.db.destinations.find((d) => d.id === current.destinationId);
      const costText = destObj
        ? destObj.cost === 0
          ? t('freeLabel')
          : formatIdr(destObj.cost)
        : '—';

      return `
        <div class="day-card">
          <div class="day-card-head">
            <h4>${escapeHtml(t('dayPrefix'))} ${index + 1}</h4>
            <span class="day-card-cost tabular-nums">${escapeHtml(costText)}</span>
          </div>
          <div class="day-card-fields">
            <label class="sr-only" for="daySelect-${index}">${escapeHtml(t('dayPrefix'))} ${index + 1}</label>
            <select id="daySelect-${index}" class="input day-dest-select" data-day="${index}">
              <option value="">${escapeHtml(t('chooseDestination'))}</option>
              ${optionsHtml}
            </select>
            <label class="sr-only" for="dayNote-${index}">${escapeHtml(t('activityNotePlaceholder'))}</label>
            <input
              id="dayNote-${index}"
              type="text"
              class="input day-note-input"
              data-day="${index}"
              maxlength="120"
              placeholder="${escapeHtml(t('activityNotePlaceholder'))}"
              value="${escapeHtml(current.note)}"
            />
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.day-dest-select').forEach((sel, index) => {
      const targetVal = daySelections[index]?.destinationId || '';
      if (targetVal && store.db.destinations.some((d) => d.id === targetVal)) {
        sel.value = targetVal;
      }
    });

    calculateBudget();
  }

  function calculateBudget() {
    readCurrentSelections();

    const days = Math.min(5, Math.max(1, Number($('tripDays')?.value || 3)));
    const travellers = Math.min(30, Math.max(1, Number($('travellers')?.value || 1)));
    const stayRate = Math.max(0, Number($('stayTier')?.value ?? 350000));
    const targetPerPerson = Math.max(0, Number($('budget')?.value || 0));

    const activityPerPerson = daySelections
      .slice(0, days)
      .reduce((sum, item) => {
        const dest = store.db.destinations.find((d) => d.id === item.destinationId);
        return sum + (dest ? Number(dest.cost) || 0 : 0);
      }, 0);

    const activityTotal = activityPerPerson * travellers;
    const stayTotal = days > 1 ? (days - 1) * stayRate * travellers : 0;
    const mealTotal = days * 100000 * travellers;
    const baseTotal = activityTotal + stayTotal + mealTotal;
    const bufferTotal = Math.round(baseTotal * 0.1);
    const grandTotal = baseTotal + bufferTotal;

    if ($('activityCost')) $('activityCost').textContent = formatIdr(activityTotal);
    if ($('stayCost')) $('stayCost').textContent = formatIdr(stayTotal);
    if ($('mealCost')) $('mealCost').textContent = formatIdr(mealTotal);
    if ($('bufferCost')) $('bufferCost').textContent = formatIdr(bufferTotal);
    if ($('totalCost')) $('totalCost').textContent = formatIdr(grandTotal);

    if ($('perPerson')) {
      const perPersonCost = Math.round(grandTotal / travellers);
      $('perPerson').textContent =
        store.language === 'en'
          ? `${travellers} traveler${travellers > 1 ? 's' : ''} · ${days} day${days > 1 ? 's' : ''} (${formatIdr(perPersonCost)}/person)`
          : `Untuk ${travellers} wisatawan · ${days} hari (${formatIdr(perPersonCost)}/orang)`;
    }

    // Budget target comparison
    const targetTotal = targetPerPerson * travellers;
    const statusBox = $('budgetStatus');
    const statusText = $('budgetStatusText');
    const targetText = $('budgetTargetText');
    const barFill = $('budgetBarFill');

    if (statusBox && statusText && targetText && barFill) {
      if (targetTotal <= 0) {
        statusBox.hidden = true;
      } else {
        statusBox.hidden = false;
        const ratio = Math.min(100, Math.round((grandTotal / targetTotal) * 100));
        const isOver = grandTotal > targetTotal;
        statusBox.classList.toggle('is-over', isOver);
        statusBox.classList.toggle('is-under', !isOver);
        statusText.textContent = isOver ? t('overBudget') : t('withinBudget');
        targetText.textContent = `${t('targetTotalPrefix')} ${formatIdr(targetTotal)}`;
        barFill.style.width = `${ratio}%`;
      }
    }

    return {
      days,
      travellers,
      stayRate,
      targetPerPerson,
      grandTotal,
    };
  }

  function saveCurrentTrip() {
    const nameInput = $('tripName');
    const name = (nameInput?.value || '').trim();
    if (!name) {
      nameInput?.classList.add('is-invalid');
      nameInput?.focus();
      showToast(t('invalidFormToast'));
      return;
    }
    nameInput?.classList.remove('is-invalid');

    const summary = calculateBudget();
    const activities = daySelections
      .slice(0, summary.days)
      .map((item, idx) => ({
        day: idx + 1,
        destinationId: item.destinationId,
        note: item.note.trim(),
      }))
      .filter((item) => item.destinationId || item.note);

    const trip = {
      id: `trip-${Date.now()}`,
      name,
      date: $('tripDate')?.value || '',
      days: summary.days,
      travellers: summary.travellers,
      stayRate: summary.stayRate,
      targetBudget: summary.targetPerPerson,
      activities,
      total: formatIdr(summary.grandTotal),
    };

    store.addTrip(trip);
    showToast(t('tripSavedToast'));
  }

  function loadTripIntoEditor(trip) {
    if ($('tripName')) $('tripName').value = trip.name || '';
    if ($('tripDate')) $('tripDate').value = trip.date || '';
    if ($('tripDays')) $('tripDays').value = String(Math.min(5, Math.max(1, trip.days || 3)));
    if ($('travellers')) $('travellers').value = String(Math.max(1, trip.travellers || 2));
    if ($('stayTier') && trip.stayRate != null) $('stayTier').value = String(trip.stayRate);
    if ($('budget') && trip.targetBudget != null) $('budget').value = String(trip.targetBudget);

    daySelections = Array.from({ length: trip.days || 3 }, (_, idx) => {
      const found = (trip.activities || []).find((a) => a.day === idx + 1);
      return {
        destinationId: found?.destinationId || '',
        note: found?.note || '',
      };
    });

    renderDayInputs(false);
    $('planner')?.scrollIntoView({ behavior: 'smooth' });
    showToast(t('tripLoadedToast'));
  }

  function loadPackage({ name, duration, destinations }) {
    if ($('tripName')) $('tripName').value = name;
    if ($('tripDays')) $('tripDays').value = String(Math.min(5, Math.max(1, duration || 3)));

    daySelections = (destinations || []).slice(0, 5).map((destId) => ({
      destinationId: destId,
      note: '',
    }));

    renderDayInputs(false);
    $('planner')?.scrollIntoView({ behavior: 'smooth' });
    showToast(t('pkgLoadedToast'));
  }

  function addDestinationToNextEmptyDay(destId) {
    readCurrentSelections();
    const days = Math.min(5, Math.max(1, Number($('tripDays')?.value || 3)));
    const emptyIdx = daySelections.slice(0, days).findIndex((item) => !item.destinationId);

    if (emptyIdx >= 0) {
      daySelections[emptyIdx].destinationId = destId;
    } else if (days < 5) {
      $('tripDays').value = String(days + 1);
      daySelections.push({ destinationId: destId, note: '' });
    } else {
      daySelections[days - 1].destinationId = destId;
    }

    renderDayInputs(false);
    $('planner')?.scrollIntoView({ behavior: 'smooth' });
    showToast(t('addedToDayToast'));
  }

  async function copyTripSummary(trip) {
    const lines = [
      `${trip.name} (${trip.days} hari, ${trip.travellers} orang)`,
      trip.date ? `Tanggal: ${trip.date}` : '',
      `Estimasi Total: ${trip.total}`,
      ...(trip.activities || []).map((act) => {
        const d = store.db.destinations.find((item) => item.id === act.destinationId);
        const destLabel = d ? `${d.name} (${d.region})` : 'Aktivitas bebas';
        return `- Hari ${act.day}: ${destLabel}${act.note ? ` — ${act.note}` : ''}`;
      }),
    ].filter(Boolean);

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      showToast(t('tripCopiedToast'));
    } catch {
      showToast(lines[0]);
    }
  }

  function renderSavedTrips() {
    const container = $('savedTrips');
    const countEl = $('savedTripsCount');
    if (countEl) {
      countEl.textContent =
        store.language === 'en'
          ? `${store.trips.length} saved`
          : `${store.trips.length} tersimpan`;
    }
    if (!container) return;

    if (!store.trips.length) {
      container.innerHTML = `<p class="small-muted">${escapeHtml(t('emptyTrips'))}</p>`;
      return;
    }

    container.innerHTML = store.trips
      .map(
        (trip) => `
          <div class="saved-trip-row">
            <div class="saved-trip-info">
              <strong>${escapeHtml(trip.name)}</strong>
              <span class="tabular-nums">
                ${escapeHtml(trip.date || '—')} · ${trip.days} ${escapeHtml(t('dayPrefix').toLowerCase())} · ${trip.travellers} org · ${(trip.activities || []).length} aktivitas
              </span>
            </div>
            <div class="saved-trip-actions">
              <strong class="price-text tabular-nums">${escapeHtml(trip.total)}</strong>
              <button type="button" class="btn btn-secondary btn-sm" data-trip-action="load" data-trip-id="${escapeHtml(trip.id)}">${escapeHtml(t('loadTripBtn'))}</button>
              <button type="button" class="btn btn-outline btn-sm" data-trip-action="copy" data-trip-id="${escapeHtml(trip.id)}">${escapeHtml(t('copyTripBtn'))}</button>
              <button type="button" class="btn btn-danger btn-sm" data-trip-action="delete" data-trip-id="${escapeHtml(trip.id)}">${escapeHtml(t('deleteBtn'))}</button>
            </div>
          </div>
        `
      )
      .join('');
  }

  function init() {
    if ($('tripDate') && !$('tripDate').value) {
      $('tripDate').value = new Date().toISOString().slice(0, 10);
    }

    $('tripDays')?.addEventListener('change', () => renderDayInputs(true));
    ['travellers', 'budget'].forEach((id) => {
      $(id)?.addEventListener('input', calculateBudget);
    });
    $('stayTier')?.addEventListener('change', calculateBudget);

    $('dayActivities')?.addEventListener('change', () => renderDayInputs(true));
    $('dayActivities')?.addEventListener('input', (e) => {
      if (e.target.classList.contains('day-note-input')) {
        readCurrentSelections();
      }
    });

    $('saveTrip')?.addEventListener('click', saveCurrentTrip);
    $('clearTrip')?.addEventListener('click', () => {
      if ($('tripName')) $('tripName').value = 'Liburan Jelajah Aceh';
      if ($('tripDays')) $('tripDays').value = '3';
      if ($('travellers')) $('travellers').value = '2';
      if ($('stayTier')) $('stayTier').value = '350000';
      if ($('budget')) $('budget').value = '1500000';
      daySelections = [];
      renderDayInputs(false);
    });

    $('savedTrips')?.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-trip-action]');
      if (!btn) return;
      const trip = store.trips.find((item) => item.id === btn.dataset.tripId);
      if (!trip) return;

      const action = btn.dataset.tripAction;
      if (action === 'load') {
        loadTripIntoEditor(trip);
      } else if (action === 'copy') {
        copyTripSummary(trip);
      } else if (action === 'delete') {
        const ok = await modalManager.confirm({
          title: t('confirmDeleteTitle'),
          message: t('confirmDeleteMsg'),
          confirmLabel: t('deleteBtn'),
          cancelLabel: t('cancelBtn'),
          danger: true,
        });
        if (ok) {
          store.deleteTrip(trip.id);
          showToast(t('tripDeletedToast'));
        }
      }
    });

    renderDayInputs(false);
    renderSavedTrips();
  }

  function render() {
    renderDayInputs(true);
    renderSavedTrips();
  }

  return {
    init,
    render,
    loadPackage,
    addDestinationToNextEmptyDay,
  };
}
