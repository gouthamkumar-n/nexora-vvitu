import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storageService';
import { createNotification } from '../services/notificationService';
import { findTopMatches } from '../services/matchingEngine';
import { SupabaseService, isSupabaseConfigured } from '../services/supabaseService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});

  // Initialize and hydrate from localStorage + Supabase
  useEffect(() => {
    StorageService.initialize();
    hydrate();
  }, []);

  async function hydrate() {
    const localLost = StorageService.getLostItems();
    const localFound = StorageService.getFoundItems();
    const localClaims = StorageService.getClaims();
    const localNotifs = StorageService.getNotifications();
    const localUsers = StorageService.getUsers();
    const localLogs = StorageService.getAuditLogs();

    setLostItems(localLost);
    setFoundItems(localFound);
    setClaims(localClaims);
    setNotifications(localNotifs);
    setUsers(localUsers);
    setAuditLogs(localLogs);
    setLocations(StorageService.getLocations());
    setCategories(StorageService.getCategories());
    setSettings(StorageService.getSettings());

    if (isSupabaseConfigured()) {
      try {
        const [cloudLost, cloudFound, cloudClaims, cloudProfiles, cloudNotifs, cloudLogs] =
          await Promise.all([
            SupabaseService.get('lost_items'),
            SupabaseService.get('found_items'),
            SupabaseService.get('claims'),
            SupabaseService.get('profiles'),
            SupabaseService.get('notifications'),
            SupabaseService.get('audit_logs'),
          ]);

        if (cloudLost && Array.isArray(cloudLost)) {
          if (cloudLost.length > 0) {
            setLostItems(cloudLost);
            StorageService.saveLostItems(cloudLost);
          } else if (localLost.length > 0) {
            SupabaseService.insert('lost_items', localLost).catch(() => {});
          }
        }
        if (cloudFound && Array.isArray(cloudFound)) {
          if (cloudFound.length > 0) {
            setFoundItems(cloudFound);
            StorageService.saveFoundItems(cloudFound);
          } else if (localFound.length > 0) {
            SupabaseService.insert('found_items', localFound).catch(() => {});
          }
        }
        if (cloudClaims && Array.isArray(cloudClaims)) {
          if (cloudClaims.length > 0) {
            setClaims(cloudClaims);
            StorageService.saveClaims(cloudClaims);
          } else if (localClaims.length > 0) {
            SupabaseService.insert('claims', localClaims).catch(() => {});
          }
        }
        if (cloudProfiles && Array.isArray(cloudProfiles)) {
          const latestLocalUsers = StorageService.getUsers();
          if (cloudProfiles.length > 0) {
            const mergedById = new Map();
            latestLocalUsers.forEach((u) => {
              const key = u.role === 'superadmin' || u.id === 'super1' ? 'super1' : (u.id || u.email?.toLowerCase());
              if (key) mergedById.set(key, u);
            });
            cloudProfiles.forEach((cu) => {
              const isSuper = cu.role === 'superadmin' || cu.id === 'super1' || cu.email?.toLowerCase() === 'super@vvitu.edu';
              const key = isSuper ? 'super1' : (cu.id || cu.email?.toLowerCase());
              if (!key) return;
              // Find existing by ID or by matching email
              const existing =
                mergedById.get(key) ||
                Array.from(mergedById.values()).find(
                  (u) => u.email?.toLowerCase() === cu.email?.toLowerCase()
                );

              // If this is the superadmin record, ensure the new official superadmin email/password takes precedence over legacy superadmin@vvitu.edu
              if (isSuper && existing) {
                const isCloudLegacySuper =
                  cu.email?.toLowerCase() === 'superadmin@vvitu.edu' ||
                  cu.email?.toLowerCase() === 'super@vvitu.edu';
                const mergedSuper = isCloudLegacySuper
                  ? {
                      ...cu,
                      ...existing,
                      id: 'super1',
                      role: 'superadmin',
                      email: existing.email || 'nukapothulagouthamkumar@gmail.com',
                      password: existing.password || 'Goutham@23',
                    }
                  : {
                      ...cu,
                      ...existing,
                      id: 'super1',
                      role: 'superadmin',
                      password: existing.password || cu.password || 'Goutham@23',
                    };
                mergedById.set('super1', mergedSuper);
                if (isCloudLegacySuper && isSupabaseConfigured()) {
                  SupabaseService.update('profiles', 'super1', {
                    name: mergedSuper.name,
                    email: mergedSuper.email,
                    password: mergedSuper.password,
                  }).catch(() => {});
                }
                return;
              }

              const targetKey = existing?.id || key;
              mergedById.set(targetKey, {
                ...existing,
                ...cu,
                id: existing?.id || cu.id,
                password: existing?.password || cu.password || 'password123',
              });
            });

            // Final pass: ensure only one superadmin and no duplicate emails
            const finalUsers = [];
            const seenEmails = new Set();
            let hasSuper = false;
            for (const u of mergedById.values()) {
              if (u.role === 'superadmin' || u.id === 'super1') {
                if (hasSuper) continue;
                hasSuper = true;
              }
              const emailKey = u.email?.toLowerCase();
              if (emailKey && seenEmails.has(emailKey)) continue;
              if (emailKey) seenEmails.add(emailKey);
              finalUsers.push(u);
            }

            setUsers(finalUsers);
            StorageService.saveUsers(finalUsers);
          } else if (latestLocalUsers.length > 0) {
            SupabaseService.insert('profiles', latestLocalUsers).catch(() => {});
          }
        }
        if (cloudNotifs && Array.isArray(cloudNotifs)) {
          if (cloudNotifs.length > 0) {
            setNotifications(cloudNotifs);
            StorageService.saveNotifications(cloudNotifs);
          } else if (localNotifs.length > 0) {
            SupabaseService.insert('notifications', localNotifs).catch(() => {});
          }
        }
        if (cloudLogs && Array.isArray(cloudLogs)) {
          if (cloudLogs.length > 0) {
            setAuditLogs(cloudLogs);
            StorageService.saveAuditLogs(cloudLogs);
          } else if (localLogs.length > 0) {
            SupabaseService.insert('audit_logs', localLogs).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Supabase sync fallback to LocalStorage:', err);
      }
    }
  }

  // ── Lost Items ──────────────────────────────────────────
  const addLostItem = useCallback((item) => {
    const newItem = {
      ...item,
      id: `lost_${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      reportId: `RPT-L-${String(Date.now()).slice(-4)}`,
    };
    const updated = [newItem, ...lostItems];
    setLostItems(updated);
    StorageService.saveLostItems(updated);

    if (isSupabaseConfigured()) {
      SupabaseService.insert('lost_items', newItem).catch((e) => console.warn(e));
    }

    // Auto-match notification
    const matches = findTopMatches(newItem, foundItems);
    if (matches.length > 0 && matches[0].score >= 50) {
      const notif = createNotification({
        userId: item.userId,
        type: 'match',
        title: 'AI Match Found!',
        message: `A found item matches your lost ${item.title} with ${matches[0].score}% confidence.`,
        link: '/ai-matching',
      });
      addNotificationDirectly(notif);
    }

    return newItem;
  }, [lostItems, foundItems]);

  const updateLostItem = useCallback((id, changes) => {
    const updated = lostItems.map((item) => item.id === id ? { ...item, ...changes } : item);
    setLostItems(updated);
    StorageService.saveLostItems(updated);
    if (isSupabaseConfigured()) {
      SupabaseService.update('lost_items', id, changes).catch((e) => console.warn(e));
    }
  }, [lostItems]);

  const deleteLostItem = useCallback((id) => {
    const updated = lostItems.filter((item) => item.id !== id);
    setLostItems(updated);
    StorageService.saveLostItems(updated);
    if (isSupabaseConfigured()) {
      SupabaseService.delete('lost_items', id).catch((e) => console.warn(e));
    }
  }, [lostItems]);

  // ── Found Items ─────────────────────────────────────────
  const addFoundItem = useCallback((item) => {
    const newItem = {
      ...item,
      id: `found_${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      reportId: `RPT-F-${String(Date.now()).slice(-4)}`,
    };
    const updated = [newItem, ...foundItems];
    setFoundItems(updated);
    StorageService.saveFoundItems(updated);

    if (isSupabaseConfigured()) {
      SupabaseService.insert('found_items', newItem).catch((e) => console.warn(e));
    }

    return newItem;
  }, [foundItems]);

  const updateFoundItem = useCallback((id, changes) => {
    const updated = foundItems.map((item) => item.id === id ? { ...item, ...changes } : item);
    setFoundItems(updated);
    StorageService.saveFoundItems(updated);
    if (isSupabaseConfigured()) {
      SupabaseService.update('found_items', id, changes).catch((e) => console.warn(e));
    }
  }, [foundItems]);

  const deleteFoundItem = useCallback((id) => {
    const updated = foundItems.filter((item) => item.id !== id);
    setFoundItems(updated);
    StorageService.saveFoundItems(updated);
    if (isSupabaseConfigured()) {
      SupabaseService.delete('found_items', id).catch((e) => console.warn(e));
    }
  }, [foundItems]);

  // ── Claims ──────────────────────────────────────────────
  const addClaim = useCallback((claim) => {
    const newClaim = {
      ...claim,
      id: `claim_${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    const updated = [newClaim, ...claims];
    setClaims(updated);
    StorageService.saveClaims(updated);

    // Update lost item status
    updateLostItem(claim.lostItemId, { status: 'claimed' });

    if (isSupabaseConfigured()) {
      SupabaseService.insert('claims', newClaim).catch((e) => console.warn(e));
    }

    return newClaim;
  }, [claims, updateLostItem]);

  const updateClaim = useCallback((id, changes) => {
    const updated = claims.map((c) => c.id === id ? { ...c, ...changes } : c);
    setClaims(updated);
    StorageService.saveClaims(updated);
    if (isSupabaseConfigured()) {
      SupabaseService.update('claims', id, changes).catch((e) => console.warn(e));
    }
  }, [claims]);

  // ── Notifications ───────────────────────────────────────
  function addNotificationDirectly(notif) {
    setNotifications((prev) => {
      const updated = [notif, ...prev];
      StorageService.saveNotifications(updated);
      return updated;
    });
    if (isSupabaseConfigured()) {
      SupabaseService.insert('notifications', notif).catch(() => {});
    }
  }

  const addNotification = useCallback((notifData) => {
    const notif = createNotification(notifData);
    addNotificationDirectly(notif);
    return notif;
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => n.id === id ? { ...n, read: true } : n);
      StorageService.saveNotifications(updated);
      return updated;
    });
    if (isSupabaseConfigured()) {
      SupabaseService.update('notifications', id, { read: true }).catch(() => {});
    }
  }, []);

  const markAllNotificationsRead = useCallback((userId) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => n.userId === userId ? { ...n, read: true } : n);
      StorageService.saveNotifications(updated);
      return updated;
    });
  }, []);

  // ── Users ───────────────────────────────────────────────
  const addUser = useCallback((user) => {
    const normalizedEmail = (user.email || '').trim().toLowerCase();
    const newUser = {
      ...user,
      email: normalizedEmail,
      id: `u_${Date.now()}`,
      password: user.password,
      isActive: true,
      customCredentials: true,
      createdAt: new Date().toISOString(),
    };
    const currentStored = StorageService.getUsers();
    const withoutDuplicateEmail = currentStored.filter(
      (u) => u.email?.toLowerCase() !== normalizedEmail
    );
    const updated = [newUser, ...withoutDuplicateEmail];
    setUsers(updated);
    StorageService.saveUsers(updated);
    if (isSupabaseConfigured()) {
      const { customCredentials, ...dbUser } = newUser;
      SupabaseService.insert('profiles', dbUser).catch((e) => console.warn(e));
    }
    return newUser;
  }, []);

  const updateUser = useCallback((id, changes) => {
    const withCustomFlag = { ...changes, customCredentials: true };
    const currentStored = StorageService.getUsers();
    const updated = currentStored.map((u) => (u.id === id ? { ...u, ...withCustomFlag } : u));
    setUsers(updated);
    StorageService.saveUsers(updated);
    if (isSupabaseConfigured()) {
      const { customCredentials, ...dbChanges } = changes;
      SupabaseService.update('profiles', id, dbChanges).catch((e) => console.warn(e));
    }
  }, []);

  const deleteUser = useCallback((id) => {
    const currentStored = StorageService.getUsers();
    const updated = currentStored.filter((u) => u.id !== id);
    setUsers(updated);
    StorageService.saveUsers(updated);
    if (isSupabaseConfigured()) {
      SupabaseService.delete('profiles', id).catch((e) => console.warn(e));
    }
  }, []);

  // ── Locations & Categories (Dynamic Campus Master Data) ─
  const updateLocations = useCallback((newLocations) => {
    setLocations(newLocations);
    StorageService.saveLocations(newLocations);
  }, []);

  const updateCategories = useCallback((newCategories) => {
    setCategories(newCategories);
    StorageService.saveCategories(newCategories);
  }, []);

  // ── Audit Logs ──────────────────────────────────────────
  const addAuditLog = useCallback((log) => {
    const newLog = StorageService.addAuditLog(log);
    setAuditLogs((prev) => [newLog, ...prev]);
    if (isSupabaseConfigured()) {
      SupabaseService.insert('audit_logs', newLog).catch(() => {});
    }
    return newLog;
  }, []);

  // ── Settings ────────────────────────────────────────────
  const updateSettings = useCallback((changes) => {
    const updated = { ...settings, ...changes };
    setSettings(updated);
    StorageService.set('nexora_settings', updated);
  }, [settings]);

  // ── Clear Inventory for Fresh Daily Use ─────────────────
  const clearAllInventory = useCallback(() => {
    const currentLost = [...lostItems];
    const currentFound = [...foundItems];
    const currentClaims = [...claims];

    StorageService.clearInventoryOnly();
    setLostItems([]);
    setFoundItems([]);
    setClaims([]);
    setNotifications([]);

    if (isSupabaseConfigured()) {
      currentClaims.forEach((c) => SupabaseService.delete('claims', c.id).catch(() => {}));
      currentLost.forEach((l) => SupabaseService.delete('lost_items', l.id).catch(() => {}));
      currentFound.forEach((f) => SupabaseService.delete('found_items', f.id).catch(() => {}));
    }
  }, [lostItems, foundItems, claims]);

  // ── Computed stats ──────────────────────────────────────
  const stats = {
    totalLost: lostItems.length,
    totalFound: foundItems.length,
    totalReturned: lostItems.filter((i) => i.status === 'returned').length +
      foundItems.filter((i) => i.status === 'returned').length,
    pendingClaims: claims.filter((c) => c.status === 'pending').length,
    suspiciousItems: [...lostItems, ...foundItems].filter((i) => i.status === 'suspicious').length,
    totalUsers: users.filter((u) => u.role === 'user').length,
    totalAdmins: users.filter((u) => u.role === 'admin').length,
    activeLost: lostItems.filter((i) => i.status === 'active').length,
    activeFound: foundItems.filter((i) => i.status === 'active').length,
  };

  return (
    <AppContext.Provider value={{
      lostItems,
      foundItems,
      claims,
      notifications,
      users,
      auditLogs,
      locations,
      categories,
      settings,
      stats,
      addLostItem,
      updateLostItem,
      deleteLostItem,
      addFoundItem,
      updateFoundItem,
      deleteFoundItem,
      addClaim,
      updateClaim,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      addUser,
      updateUser,
      deleteUser,
      updateLocations,
      updateCategories,
      addAuditLog,
      updateSettings,
      clearAllInventory,
      hydrate,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
