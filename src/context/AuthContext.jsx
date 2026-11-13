import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SAMPLE_USERS } from '../data/sampleData';
import { StorageService } from '../services/storageService';
import { SupabaseService, isSupabaseConfigured } from '../services/supabaseService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'user' | 'admin' | 'superadmin'
  const [loading, setLoading] = useState(true);

  // Restore session from sessionStorage and sync latest role/status from StorageService
  useEffect(() => {
    try {
      StorageService.initialize();
      const savedSession = sessionStorage.getItem('nexora_session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        const allUsers = StorageService.getUsers();
        const latestUser = allUsers.find((u) => u.id === session.user?.id) || session.user;
        if (latestUser && latestUser.isActive !== false) {
          if (latestUser.avatar && String(latestUser.avatar).includes('pravatar.cc')) {
            latestUser.avatar = '';
          }
          setUser(latestUser);
          setRole(latestUser.role || session.role);
        } else {
          sessionStorage.removeItem('nexora_session');
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSession = (userData, userRole) => {
    sessionStorage.setItem('nexora_session', JSON.stringify({ user: userData, role: userRole }));
  };

  /**
   * Real multi-user authentication against stored user accounts.
   * @param {string} email
   * @param {string} password
   * @param {'standard' | 'superadmin'} loginMode
   *   - 'standard': Shared login for Students/Faculty/Staff ('user') and Administrators ('admin').
   *                 Automatically routes 'admin' -> '/admin' and 'user' -> '/dashboard'.
   *   - 'superadmin': Dedicated login exclusively for Super Administrator ('superadmin') -> '/system'.
   */
  const login = useCallback((email, password, loginMode = 'standard') => {
    StorageService.initialize();
    const normalizedEmail = email.trim().toLowerCase();

    // Also allow legacy aliases to resolve to the Super Admin account
    const lookupEmail =
      normalizedEmail === 'super@vvitu.edu' || normalizedEmail === 'superadmin@vvitu.edu'
        ? 'nukapothulagouthamkumar@gmail.com'
        : normalizedEmail;

    const users = StorageService.getUsers();
    // Find all records matching this email (or superadmin role if signing in with the configured superadmin email)
    const matchingUsers = users.filter(
      (u) =>
        u.email?.toLowerCase() === lookupEmail ||
        (lookupEmail === 'nukapothulagouthamkumar@gmail.com' && (u.role === 'superadmin' || u.id === 'super1'))
    );
    const sampleFallback = SAMPLE_USERS.find((u) => u.email.toLowerCase() === lookupEmail);

    // Prefer the record whose password matches what the user typed, or the newest matching record
    const userData =
      matchingUsers.find((u) => u.password === password || u.password === password.trim()) ||
      matchingUsers[matchingUsers.length - 1] ||
      matchingUsers[0] ||
      sampleFallback;

    if (!userData) {
      return {
        success: false,
        error: 'No account found with this email address. Students can register a new account below.',
      };
    }

    if (userData.isActive === false) {
      return {
        success: false,
        error: 'This account has been suspended by the Super Administrator. Please contact campus administration.',
      };
    }

    // Check password (support user's stored password; also allow legacy 'demo1234' for sample student accounts)
    const expectedPassword =
      userData.password ||
      (userData.role === 'superadmin'
        ? 'Goutham@23'
        : userData.role === 'admin'
        ? 'admin1234'
        : 'password123');

    // Self-heal accounts created before the cloud-sync password fix (where cloud sync reset password to 'password123')
    const isNeedsRepair =
      String(userData.id || '').startsWith('u_') &&
      !userData.customCredentials &&
      (expectedPassword === 'password123' || expectedPassword === 'admin1234') &&
      password.length >= 4;

    if (isNeedsRepair) {
      userData.password = password;
      userData.customCredentials = true;
      StorageService.updateItem('nexora_users', userData.id, {
        password,
        customCredentials: true,
      });
      if (isSupabaseConfigured()) {
        SupabaseService.insert('profiles', userData).catch(() => {});
      }
    }

    const isPasswordValid =
      isNeedsRepair ||
      password === expectedPassword ||
      password.trim() === String(expectedPassword).trim() ||
      (userData.role === 'superadmin' && password === 'Goutham@23') ||
      matchingUsers.some((u) => u.password && (u.password === password || u.password.trim() === password.trim())) ||
      (userData.role === 'user' && password === 'demo1234');

    if (!isPasswordValid) {
      return { success: false, error: 'Incorrect password. Please check your credentials and try again.' };
    }

    // Enforce login portal separation between Standard (Student/Admin) and Super Admin
    if (loginMode === 'superadmin') {
      if (userData.role !== 'superadmin') {
        return {
          success: false,
          error: 'Access denied. Only the Super Administrator can sign in through the Super Admin portal.',
        };
      }
    } else {
      if (userData.role === 'superadmin') {
        return {
          success: false,
          error: 'Super Administrator accounts must sign in using the "Super Admin Portal" tab above.',
        };
      }
    }

    const effectiveRole = userData.role || 'user';
    const redirectTo =
      effectiveRole === 'superadmin'
        ? '/system'
        : effectiveRole === 'admin'
        ? '/admin'
        : '/dashboard';

    setUser(userData);
    setRole(effectiveRole);
    saveSession(userData, effectiveRole);

    StorageService.addAuditLog({
      action: 'USER_LOGIN',
      userId: userData.id,
      userName: userData.name,
      details: `${userData.name} (${effectiveRole.toUpperCase()}) signed in`,
    });

    return {
      success: true,
      user: userData,
      role: effectiveRole,
      redirectTo,
    };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
    sessionStorage.removeItem('nexora_session');
  }, []);

  const updateUser = useCallback((updates) => {
    if (!user) return;
    const withCustomFlag = { ...updates, customCredentials: true };
    const updated = { ...user, ...withCustomFlag };
    const updatedRole = updates.role || role;
    setUser(updated);
    setRole(updatedRole);
    saveSession(updated, updatedRole);
    StorageService.updateItem('nexora_users', updated.id, withCustomFlag);
    if (isSupabaseConfigured()) {
      const { customCredentials, ...dbUpdates } = updates;
      SupabaseService.update('profiles', updated.id, dbUpdates).catch(() => {});
    }
  }, [user, role]);

  const changePassword = useCallback((currentPassword, newPassword) => {
    if (!user) return { success: false, error: 'Not authenticated.' };
    const users = StorageService.getUsers();
    const currentRecord = users.find((u) => u.id === user.id) || user;
    const expectedPassword =
      currentRecord.password ||
      (currentRecord.role === 'superadmin'
        ? 'super1234'
        : currentRecord.role === 'admin'
        ? 'admin1234'
        : 'password123');

    if (currentPassword !== expectedPassword && !(currentRecord.role === 'user' && currentPassword === 'demo1234')) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    const updated = { ...currentRecord, password: newPassword };
    setUser(updated);
    saveSession(updated, role);
    StorageService.updateItem('nexora_users', user.id, { password: newPassword });
    if (isSupabaseConfigured()) {
      SupabaseService.update('profiles', user.id, { password: newPassword }).catch(() => {});
    }
    return { success: true };
  }, [user, role]);

  const isUser = role === 'user';
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isSuperAdmin = role === 'superadmin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      role,
      loading,
      isUser,
      isAdmin,
      isSuperAdmin,
      isAuthenticated,
      login,
      logout,
      updateUser,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
