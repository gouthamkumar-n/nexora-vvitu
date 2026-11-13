// ============================================================
// StorageService – LocalStorage & State Persistence Layer for NEXORA
// ============================================================

import {
  SAMPLE_LOST_ITEMS,
  SAMPLE_FOUND_ITEMS,
  SAMPLE_CLAIMS,
  SAMPLE_NOTIFICATIONS,
  SAMPLE_USERS,
  SAMPLE_AUDIT_LOGS,
  CAMPUS_LOCATIONS,
  ITEM_CATEGORIES,
} from '../data/sampleData';

const KEYS = {
  LOST_ITEMS: 'nexora_lost_items',
  FOUND_ITEMS: 'nexora_found_items',
  CLAIMS: 'nexora_claims',
  NOTIFICATIONS: 'nexora_notifications',
  USERS: 'nexora_users',
  AUDIT_LOGS: 'nexora_audit_logs',
  LOCATIONS: 'nexora_locations',
  CATEGORIES: 'nexora_categories',
  INITIALIZED: 'nexora_initialized_v3',
  SETTINGS: 'nexora_settings',
};

export const StorageService = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      console.error('StorageService.set failed for key:', key);
      return false;
    }
  },

  update(key, updater) {
    const current = this.get(key, []);
    const updated = updater(current);
    return this.set(key, updated);
  },

  append(key, item) {
    return this.update(key, (arr) => [...(Array.isArray(arr) ? arr : []), item]);
  },

  removeItem(key, id) {
    return this.update(key, (arr) => arr.filter((item) => item.id !== id));
  },

  updateItem(key, id, changes) {
    return this.update(key, (arr) =>
      arr.map((item) => (item.id === id ? { ...item, ...changes } : item))
    );
  },

  clear() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },

  initialize(force = false) {
    const existingLost = this.get(KEYS.LOST_ITEMS, []);
    const hasOldPicsum = existingLost.some(
      (item) => item.imageUrl && item.imageUrl.includes('picsum.photos')
    );

    const existingUsers = this.get(KEYS.USERS, []);
    if (existingUsers.length > 0 && !force) {
      // Ensure all existing users have passwords, strip random pravatar URLs, and deduplicate superadmin/duplicate IDs
      const sampleSuper = SAMPLE_USERS.find((s) => s.id === 'super1');
      const superAdmins = existingUsers.filter((u) => u.role === 'superadmin' || u.id === 'super1');
      // Pick the customized superadmin if one exists, otherwise the latest one
      const primarySuper =
        superAdmins.find((u) => u.customCredentials && u.email !== 'super@vvitu.edu') ||
        superAdmins.find((u) => u.customCredentials) ||
        superAdmins[superAdmins.length - 1] ||
        sampleSuper;

      const seenIds = new Set();
      const seenEmails = new Set();
      const deduplicatedUsers = [];

      for (const u of existingUsers) {
        if (u.role === 'superadmin' || u.id === 'super1') {
          if (seenIds.has('super1')) continue;
          seenIds.add('super1');
          const cleanAvatar = u.avatar && u.avatar.includes('pravatar.cc') ? '' : (u.avatar || '');
          const isOldDefaultSuper =
            !primarySuper?.customCredentials ||
            primarySuper?.email === 'superadmin@vvitu.edu' ||
            primarySuper?.email === 'super@vvitu.edu';
          const mergedSuper = isOldDefaultSuper
            ? {
                ...primarySuper,
                ...sampleSuper,
                id: 'super1',
                role: 'superadmin',
                avatar: cleanAvatar,
              }
            : {
                ...sampleSuper,
                ...primarySuper,
                id: 'super1',
                role: 'superadmin',
                avatar: cleanAvatar,
              };
          seenEmails.add(mergedSuper.email?.toLowerCase());
          deduplicatedUsers.push(mergedSuper);
          continue;
        }

        const emailKey = u.email?.toLowerCase();
        if ((u.id && seenIds.has(u.id)) || (emailKey && seenEmails.has(emailKey))) {
          continue;
        }
        if (u.id) seenIds.add(u.id);
        if (emailKey) seenEmails.add(emailKey);

        const cleanAvatar = u.avatar && u.avatar.includes('pravatar.cc') ? '' : (u.avatar || '');
        if (u.password) {
          deduplicatedUsers.push({ ...u, avatar: cleanAvatar });
        } else {
          const sample = SAMPLE_USERS.find((s) => s.email.toLowerCase() === emailKey);
          deduplicatedUsers.push({
            ...u,
            avatar: cleanAvatar,
            password:
              sample?.password ||
              (u.role === 'admin' ? 'admin1234' : 'password123'),
          });
        }
      }
      this.set(KEYS.USERS, deduplicatedUsers);
    }

    if (!this.get(KEYS.LOCATIONS)) {
      this.set(KEYS.LOCATIONS, CAMPUS_LOCATIONS);
    }
    if (!this.get(KEYS.CATEGORIES)) {
      this.set(KEYS.CATEGORIES, ITEM_CATEGORIES);
    }

    if (!force && localStorage.getItem(KEYS.INITIALIZED) && !hasOldPicsum) return;

    this.set(KEYS.LOST_ITEMS, SAMPLE_LOST_ITEMS);
    this.set(KEYS.FOUND_ITEMS, SAMPLE_FOUND_ITEMS);
    this.set(KEYS.CLAIMS, SAMPLE_CLAIMS);
    this.set(KEYS.NOTIFICATIONS, SAMPLE_NOTIFICATIONS);
    if (existingUsers.length === 0 || force) {
      this.set(KEYS.USERS, SAMPLE_USERS);
    }
    this.set(KEYS.AUDIT_LOGS, SAMPLE_AUDIT_LOGS);
    this.set(KEYS.LOCATIONS, CAMPUS_LOCATIONS);
    this.set(KEYS.CATEGORIES, ITEM_CATEGORIES);
    this.set(KEYS.SETTINGS, {
      systemName: 'NEXORA',
      contactEmail: 'lost-found@vvitu.edu',
      maxUploadSizeMB: 5,
      sessionTimeoutMinutes: 60,
      failedLoginThreshold: 5,
    });
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  },

  reset() {
    this.clear();
    this.initialize(true);
  },

  clearInventoryOnly() {
    this.set(KEYS.LOST_ITEMS, []);
    this.set(KEYS.FOUND_ITEMS, []);
    this.set(KEYS.CLAIMS, []);
    this.set(KEYS.NOTIFICATIONS, []);
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  },

  // Convenience getters
  getLostItems: () => StorageService.get(KEYS.LOST_ITEMS, []),
  getFoundItems: () => StorageService.get(KEYS.FOUND_ITEMS, []),
  getClaims: () => StorageService.get(KEYS.CLAIMS, []),
  getNotifications: () => StorageService.get(KEYS.NOTIFICATIONS, []),
  getUsers: () => StorageService.get(KEYS.USERS, []),
  getAuditLogs: () => StorageService.get(KEYS.AUDIT_LOGS, []),
  getLocations: () => StorageService.get(KEYS.LOCATIONS, CAMPUS_LOCATIONS),
  getCategories: () => StorageService.get(KEYS.CATEGORIES, ITEM_CATEGORIES),
  getSettings: () => StorageService.get(KEYS.SETTINGS, {}),

  // Convenience setters
  saveLostItems: (items) => StorageService.set(KEYS.LOST_ITEMS, items),
  saveFoundItems: (items) => StorageService.set(KEYS.FOUND_ITEMS, items),
  saveClaims: (claims) => StorageService.set(KEYS.CLAIMS, claims),
  saveNotifications: (notifs) => StorageService.set(KEYS.NOTIFICATIONS, notifs),
  saveUsers: (users) => StorageService.set(KEYS.USERS, users),
  saveAuditLogs: (logs) => StorageService.set(KEYS.AUDIT_LOGS, logs),
  saveLocations: (locs) => StorageService.set(KEYS.LOCATIONS, locs),
  saveCategories: (cats) => StorageService.set(KEYS.CATEGORIES, cats),

  addAuditLog(log) {
    const logs = this.getAuditLogs();
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.saveAuditLogs([newLog, ...logs]);
    return newLog;
  },
};
