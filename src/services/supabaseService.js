// ============================================================
// NEXORA Supabase REST Service (Zero-dependency PostgREST client)
// Uses standard browser fetch API to interact with Supabase tables.
// Automatically maps camelCase <-> snake_case and falls back to LocalStorage.
// ============================================================

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return !!(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.includes('supabase.co'));
};

const getHeaders = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
});

// Field mappings per table (Frontend camelCase <-> Database snake_case)
const MAPPINGS = {
  lost_items: {
    toDb: (item) => ({
      id: item.id,
      report_id: item.reportId || `RPT-L-${String(Date.now()).slice(-4)}`,
      title: item.title,
      category: item.category,
      brand: item.brand || null,
      color: item.color,
      description: item.description,
      location: item.location,
      date_lost: item.dateLost,
      time_lost: item.timeLost || null,
      image_url: item.imageUrl || item.image || null,
      user_id: item.userId || null,
      user_name: item.userName || null,
      private_details: item.privateDetails || null,
      status: item.status || 'active',
      created_at: item.createdAt || new Date().toISOString(),
    }),
    fromDb: (row) => ({
      id: row.id,
      reportId: row.report_id,
      title: row.title,
      category: row.category,
      brand: row.brand,
      color: row.color,
      description: row.description,
      location: row.location,
      dateLost: row.date_lost,
      timeLost: row.time_lost,
      imageUrl: row.image_url,
      userId: row.user_id,
      userName: row.user_name,
      privateDetails: row.private_details,
      status: row.status,
      createdAt: row.created_at,
    }),
  },
  found_items: {
    toDb: (item) => ({
      id: item.id,
      report_id: item.reportId || `RPT-F-${String(Date.now()).slice(-4)}`,
      title: item.title,
      category: item.category,
      brand: item.brand || null,
      color: item.color,
      description: item.description,
      found_location: item.foundLocation,
      date_found: item.dateFound,
      time_found: item.timeFound || null,
      image_url: item.imageUrl || item.image || null,
      found_by: item.foundBy || null,
      found_by_name: item.foundByName || null,
      public_description: item.publicDescription || item.description || null,
      private_details: item.privateDetails || null,
      storage_location: item.storageLocation || 'Main Block',
      status: item.status || 'active',
      created_at: item.createdAt || new Date().toISOString(),
    }),
    fromDb: (row) => ({
      id: row.id,
      reportId: row.report_id,
      title: row.title,
      category: row.category,
      brand: row.brand,
      color: row.color,
      description: row.description,
      foundLocation: row.found_location,
      dateFound: row.date_found,
      timeFound: row.time_found,
      imageUrl: row.image_url,
      foundBy: row.found_by,
      foundByName: row.found_by_name,
      publicDescription: row.public_description,
      privateDetails: row.private_details,
      storageLocation: row.storage_location,
      status: row.status,
      createdAt: row.created_at,
    }),
  },
  claims: {
    toDb: (c) => ({
      id: c.id,
      lost_item_id: c.lostItemId || null,
      found_item_id: c.foundItemId || null,
      claimant_id: c.claimantId || null,
      claimant_name: c.claimantName || 'VVITU User',
      private_answers: c.privateAnswers || c.details || '',
      evidence_url: c.evidence || null,
      match_score: c.matchScore ?? 85,
      status: c.status || 'pending',
      admin_notes: c.adminNotes || null,
      verified_by: c.verifiedBy || null,
      handover_date: c.handoverDate ? c.handoverDate.split('T')[0] : null,
      handover_method: c.handoverMethod || null,
      submitted_at: c.submittedAt || new Date().toISOString(),
    }),
    fromDb: (row) => ({
      id: row.id,
      lostItemId: row.lost_item_id,
      foundItemId: row.found_item_id,
      claimantId: row.claimant_id,
      claimantName: row.claimant_name,
      privateAnswers: row.private_answers,
      evidence: row.evidence_url,
      matchScore: row.match_score,
      status: row.status,
      adminNotes: row.admin_notes,
      verifiedBy: row.verified_by,
      handoverDate: row.handover_date,
      handoverMethod: row.handover_method,
      submittedAt: row.submitted_at,
    }),
  },
  profiles: {
    toDb: (u) => {
      const raw = u.avatar && !u.avatar.includes('pravatar.cc') ? u.avatar : '';
      const baseAvatar = raw.split('#pw=')[0];
      const pw = u.password || 'password123';
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        password: pw,
        role: u.role || 'user',
        user_type: u.userType || 'Student',
        student_id: u.studentId || null,
        department: u.department || null,
        phone: u.phone || null,
        avatar_url: `${baseAvatar}#pw=${encodeURIComponent(pw)}`,
        is_active: u.isActive !== false,
        created_at: u.createdAt || new Date().toISOString(),
      };
    },
    fromDb: (row) => {
      const rawAvatar = row.avatar_url || '';
      const [parsedAvatar, encodedPw] = rawAvatar.split('#pw=');
      const cleanAvatar = parsedAvatar && !parsedAvatar.includes('pravatar.cc') ? parsedAvatar : '';
      const extractedPw = row.password || (encodedPw ? decodeURIComponent(encodedPw) : undefined);
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        ...(extractedPw ? { password: extractedPw } : {}),
        role: row.role || 'user',
        userType: row.user_type || 'Student',
        studentId: row.student_id,
        department: row.department,
        phone: row.phone,
        avatar: cleanAvatar,
        isActive: row.is_active !== false,
        createdAt: row.created_at,
      };
    },
  },
  notifications: {
    toDb: (n) => ({
      id: n.id,
      user_id: n.userId || null,
      type: n.type || 'system',
      title: n.title,
      message: n.message,
      read: !!n.read,
      link: n.link || null,
      created_at: n.createdAt || new Date().toISOString(),
    }),
    fromDb: (row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      read: !!row.read,
      link: row.link,
      createdAt: row.created_at,
    }),
  },
  audit_logs: {
    toDb: (l) => ({
      id: l.id,
      action: l.action,
      user_id: l.userId || null,
      user_name: l.userName || 'System',
      target_id: l.targetId || null,
      target_type: l.targetType || null,
      details: l.details || '',
      timestamp: l.timestamp || new Date().toISOString(),
    }),
    fromDb: (row) => ({
      id: row.id,
      action: row.action,
      userId: row.user_id,
      userName: row.user_name,
      targetId: row.target_id,
      targetType: row.target_type,
      details: row.details,
      timestamp: row.timestamp,
    }),
  },
};

function mapUpdatesToDb(table, updates) {
  const map = {
    reportId: 'report_id',
    dateLost: 'date_lost',
    timeLost: 'time_lost',
    imageUrl: 'image_url',
    userId: 'user_id',
    userName: 'user_name',
    privateDetails: 'private_details',
    createdAt: 'created_at',
    foundLocation: 'found_location',
    dateFound: 'date_found',
    timeFound: 'time_found',
    foundBy: 'found_by',
    foundByName: 'found_by_name',
    publicDescription: 'public_description',
    storageLocation: 'storage_location',
    lostItemId: 'lost_item_id',
    foundItemId: 'found_item_id',
    claimantId: 'claimant_id',
    claimantName: 'claimant_name',
    privateAnswers: 'private_answers',
    evidence: 'evidence_url',
    matchScore: 'match_score',
    adminNotes: 'admin_notes',
    verifiedBy: 'verified_by',
    handoverDate: 'handover_date',
    handoverMethod: 'handover_method',
    submittedAt: 'submitted_at',
    userType: 'user_type',
    studentId: 'student_id',
    avatar: 'avatar_url',
    isActive: 'is_active',
    targetId: 'target_id',
    targetType: 'target_type',
  };
  const result = {};
  for (const [k, v] of Object.entries(updates)) {
    const dbKey = map[k] || k;
    result[dbKey] = k === 'handoverDate' && typeof v === 'string' ? v.split('T')[0] : v;
  }
  return result;
}

function stripPasswordField(payload) {
  if (Array.isArray(payload)) {
    return payload.map(({ password, ...rest }) => rest);
  }
  if (payload && typeof payload === 'object') {
    const { password, ...rest } = payload;
    return rest;
  }
  return payload;
}

export const SupabaseService = {
  async get(table, select = '*') {
    if (!isSupabaseConfigured()) return null;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}&order=created_at.desc`,
        { headers: getHeaders() }
      );
      if (!res.ok) {
        const resFallback = await fetch(
          `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}`,
          { headers: getHeaders() }
        );
        if (!resFallback.ok) return null;
        const rows = await resFallback.json();
        const mapper = MAPPINGS[table]?.fromDb;
        return Array.isArray(rows) ? (mapper ? rows.map(mapper) : rows) : null;
      }
      const rows = await res.json();
      const mapper = MAPPINGS[table]?.fromDb;
      return Array.isArray(rows) ? (mapper ? rows.map(mapper) : rows) : null;
    } catch (err) {
      console.warn(`[Supabase] Network error fetching ${table}:`, err);
      return null;
    }
  },

  async insert(table, record) {
    if (!isSupabaseConfigured()) return null;
    try {
      const mapper = MAPPINGS[table]?.toDb;
      const payload = Array.isArray(record)
        ? record.map((r) => (mapper ? mapper(r) : r))
        : mapper
        ? mapper(record)
        : record;

      let res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(payload),
      });

      // Fallback if 'profiles' table does not have 'password' column yet
      if (!res.ok && table === 'profiles') {
        res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            ...getHeaders(),
            Prefer: 'resolution=merge-duplicates,return=representation',
          },
          body: JSON.stringify(stripPasswordField(payload)),
        });
      }

      if (!res.ok) {
        console.warn(`[Supabase] POST /${table} returned ${res.status}`);
        return null;
      }
      const data = await res.json();
      const fromDb = MAPPINGS[table]?.fromDb;
      if (Array.isArray(data)) {
        return fromDb ? data.map(fromDb) : data;
      }
      return fromDb && data ? fromDb(data) : data;
    } catch (err) {
      console.warn(`[Supabase] Network error inserting into ${table}:`, err);
      return null;
    }
  },

  async update(table, id, updates) {
    if (!isSupabaseConfigured()) return null;
    try {
      const payload = mapUpdatesToDb(table, updates);
      let res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok && table === 'profiles' && 'password' in payload) {
        const fallbackPayload = stripPasswordField(payload);
        if (Object.keys(fallbackPayload).length === 0) return null;
        res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(fallbackPayload),
        });
      }

      if (!res.ok) {
        console.warn(`[Supabase] PATCH /${table} returned ${res.status}`);
        return null;
      }
      const data = await res.json();
      const fromDb = MAPPINGS[table]?.fromDb;
      const row = Array.isArray(data) ? data[0] : data;
      return fromDb && row ? fromDb(row) : row;
    } catch (err) {
      console.warn(`[Supabase] Network error updating ${table}:`, err);
      return null;
    }
  },

  async delete(table, id) {
    if (!isSupabaseConfigured()) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return res.ok;
    } catch (err) {
      console.warn(`[Supabase] Network error deleting from ${table}:`, err);
      return false;
    }
  },
};
