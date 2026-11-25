import './styles/main.css';
import { createTranslator } from './i18n/translations.js';
import { createAdminController } from './modules/admin.js';
import { createExplorerController } from './modules/explorer.js';
import { createMapController } from './modules/map.js';
import { createPackagesController } from './modules/packages.js';
import { createPlannerController } from './modules/planner.js';
import { store } from './state/store.js';
import { $, bindImageFallbacks, modalManager } from './utils/dom.js';

const t = createTranslator(() => store.language);

function applyStaticTranslations() {
  document.documentElement.lang = store.language;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (key) {
      el.textContent = t(key);
    }
  });

  const searchInput = $('searchDest');
  if (searchInput) {
    searchInput.placeholder = t('searchPlaceholder');
  }

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    const active = btn.dataset.lang === store.language;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function setupMobileNavigation() {
  const menuBtn = $('mobileMenuBtn');
  const drawer = $('mobileDrawer');
  if (!menuBtn || !drawer) return;

  menuBtn.addEventListener('click', () => {
    const isHidden = drawer.hidden;
    drawer.hidden = !isHidden;
    menuBtn.setAttribute('aria-expanded', String(isHidden));
  });

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      drawer.hidden = true;
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

function bootstrap() {
  modalManager.init();
  setupMobileNavigation();
  bindImageFallbacks(document);

  let explorer;
  const planner = createPlannerController({ t });
  const mapController = createMapController({
    t,
    onOpenDetail: (id) => explorer.openDestinationDetail(id),
  });
  explorer = createExplorerController({
    t,
    onAddToPlanner: (id) => planner.addDestinationToNextEmptyDay(id),
  });
  const packages = createPackagesController({
    t,
    onUsePackage: (pkg) => planner.loadPackage(pkg),
  });
  const admin = createAdminController({ t });

  applyStaticTranslations();

  explorer.init();
  explorer.render();
  planner.init();
  packages.init();
  admin.init();
  mapController.init();

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.setLanguage(btn.dataset.lang);
    });
  });

  store.subscribe((topic) => {
    if (topic === 'language') {
      applyStaticTranslations();
      explorer.render();
      planner.render();
      packages.render();
      admin.render();
      mapController.render();
    } else if (topic === 'favorites') {
      explorer.render();
    } else if (topic === 'trips') {
      planner.render();
    } else if (topic === 'db' || topic === 'all') {
      explorer.render();
      planner.render();
      packages.render();
      admin.render();
      mapController.render();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
