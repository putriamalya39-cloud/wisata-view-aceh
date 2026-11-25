import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { dynamicMapLayer } from 'esri-leaflet';
import { REGIONS, REGION_BOUNDS } from '../data/sampleData.js';
import { store } from '../state/store.js';
import { $, escapeHtml, formatIdr, sanitizeUrl } from '../utils/dom.js';

function createPinIcon(isActive = false) {
  const fill = isActive ? '#9e731f' : '#075b46';
  const html = `
    <div class="aceh-pin ${isActive ? 'is-highlighted' : ''}">
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M14 1C6.82 1 1 6.82 1 14C1 23.75 14 35 14 35C14 35 27 23.75 27 14C27 6.82 21.18 1 14 1Z" fill="${fill}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="14" cy="13.5" r="4.5" fill="#ffffff"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    className: 'aceh-pin-wrap',
    html,
    iconSize: [28, 36],
    iconAnchor: [14, 35],
    popupAnchor: [0, -32],
  });
}

export function createMapController({ t, onOpenDetail }) {
  let map = null;
  let markersLayer = null;
  let activeRegion = '';
  let activeDestinationId = null;
  let markersById = new Map();
  let rbiLayer = null;
  let osmLayer = null;
  let currentLayerKind = 'rbi';
  let rbiErrorCount = 0;

  function updateLayerStatus() {
    const statusEl = $('mapLayerStatus');
    if (!statusEl) return;
    statusEl.textContent = currentLayerKind === 'rbi' ? t('mapLayerRbi') : t('mapLayerOsm');
  }

  function renderRegionChips() {
    const container = $('regionChips');
    if (!container) return;

    const regions = [
      { value: '', label: t('mapAllRegions') },
      ...REGIONS.map((r) => ({ value: r, label: r })),
    ];

    container.innerHTML = regions
      .map(
        (r) => `
          <button
            type="button"
            class="seg-btn ${activeRegion === r.value ? 'is-active' : ''}"
            data-region="${escapeHtml(r.value)}"
            aria-pressed="${activeRegion === r.value ? 'true' : 'false'}"
          >${escapeHtml(r.label)}</button>
        `
      )
      .join('');
  }

  function renderSidebarList() {
    const listEl = $('mapDestinationList');
    if (!listEl) return;

    const items = store.db.destinations.filter(
      (d) => !activeRegion || d.region === activeRegion
    );

    if (!items.length) {
      listEl.innerHTML = `<p class="small-muted" style="padding:1rem 0">${escapeHtml(t('emptyDest'))}</p>`;
      return;
    }

    listEl.innerHTML = items
      .map(
        (d) => `
          <button type="button" class="map-dir-item" data-map-dest="${escapeHtml(d.id)}">
            <div>
              <strong>${escapeHtml(d.name)}</strong>
              <span>${escapeHtml(d.category)} · ${escapeHtml(d.region)}</span>
            </div>
            <span class="tabular-nums">${d.cost === 0 ? escapeHtml(t('freeLabel')) : escapeHtml(formatIdr(d.cost))}</span>
          </button>
        `
      )
      .join('');
  }

  function renderMarkers() {
    if (!map || !markersLayer) return;
    markersLayer.clearLayers();
    markersById.clear();

    const bounds = [];
    const items = store.db.destinations.filter(
      (d) => !activeRegion || d.region === activeRegion
    );

    items.forEach((d) => {
      const lat = Number(d.lat);
      const lng = Number(d.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      bounds.push([lat, lng]);
      const marker = L.marker([lat, lng], {
        icon: createPinIcon(d.id === activeDestinationId),
        title: d.name,
      });

      const directionsUrl = sanitizeUrl(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${d.name} Aceh Indonesia`)}`
      );

      const popupContainer = document.createElement('div');
      popupContainer.innerHTML = `
        <strong class="popup-title">${escapeHtml(d.name)}</strong>
        <span class="popup-meta">${escapeHtml(d.region)} · ${escapeHtml(d.category)}</span>
        <div class="popup-actions">
          <button type="button" class="popup-link" data-popup-detail="${escapeHtml(d.id)}">${escapeHtml(t('mapViewDetail'))}</button>
          <a class="popup-link" href="${escapeHtml(directionsUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('mapOpenMaps'))} ↗</a>
        </div>
      `;

      popupContainer.querySelector('[data-popup-detail]')?.addEventListener('click', () => {
        onOpenDetail(d.id);
      });

      marker.bindPopup(popupContainer);
      marker.addTo(markersLayer);
      markersById.set(d.id, marker);
    });

    if (activeRegion && REGION_BOUNDS[activeRegion]) {
      map.fitBounds(REGION_BOUNDS[activeRegion], { padding: [24, 24], maxZoom: 12 });
    } else if (bounds.length) {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 9 });
    }
  }

  function focusDestination(destId) {
    const dest = store.db.destinations.find((d) => d.id === destId);
    if (!dest || !map) return;
    activeDestinationId = destId;

    markersById.forEach((marker, id) => {
      marker.setIcon(createPinIcon(id === destId));
    });

    const targetMarker = markersById.get(destId);
    if (targetMarker) {
      map.setView(targetMarker.getLatLng(), Math.max(map.getZoom(), 11), { animate: true });
      targetMarker.openPopup();
    }
  }

  function init() {
    const mapEl = $('realMap');
    if (!mapEl) return;

    if (map) {
      map.remove();
      map = null;
    }

    map = L.map(mapEl, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([4.85, 96.7], 7);

    osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
    });

    try {
      rbiLayer = dynamicMapLayer({
        url: 'https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer',
        opacity: 1,
        useCors: true,
      });

      rbiLayer.on('requesterror', () => {
        rbiErrorCount += 1;
        if (rbiErrorCount >= 2 && currentLayerKind === 'rbi' && map) {
          if (map.hasLayer(rbiLayer)) map.removeLayer(rbiLayer);
          if (!map.hasLayer(osmLayer)) osmLayer.addTo(map);
          currentLayerKind = 'osm';
          updateLayerStatus();
        }
      });

      rbiLayer.addTo(map);
      currentLayerKind = 'rbi';

      L.control
        .layers(
          {
            'Rupabumi Indonesia (BIG)': rbiLayer,
            OpenStreetMap: osmLayer,
          },
          null,
          { collapsed: false }
        )
        .addTo(map);

      map.on('baselayerchange', (e) => {
        currentLayerKind = e.name === 'OpenStreetMap' ? 'osm' : 'rbi';
        updateLayerStatus();
      });
    } catch {
      osmLayer.addTo(map);
      currentLayerKind = 'osm';
    }

    markersLayer = L.layerGroup().addTo(map);

    $('regionChips')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-region]');
      if (!btn) return;
      activeRegion = btn.dataset.region || '';
      activeDestinationId = null;
      renderRegionChips();
      renderSidebarList();
      renderMarkers();
    });

    $('mapDestinationList')?.addEventListener('click', (e) => {
      const item = e.target.closest('[data-map-dest]');
      if (!item) return;
      focusDestination(item.dataset.mapDest);
    });

    const resizeObserver = new ResizeObserver(() => {
      map?.invalidateSize();
    });
    resizeObserver.observe(mapEl);

    render();
    setTimeout(() => map?.invalidateSize(), 250);
  }

  function render() {
    renderRegionChips();
    renderSidebarList();
    renderMarkers();
    updateLayerStatus();
  }

  return { init, render };
}
