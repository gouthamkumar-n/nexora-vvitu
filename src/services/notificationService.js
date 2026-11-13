// ============================================================
// NotificationService – Notification helpers for NEXORA demo
// ============================================================

export const NOTIFICATION_TYPES = {
  MATCH: 'match',
  CLAIM_SUBMITTED: 'claim_submitted',
  CLAIM_APPROVED: 'claim_approved',
  CLAIM_REJECTED: 'claim_rejected',
  REPORT_SUBMITTED: 'report_submitted',
  NEW_CLAIM: 'new_claim',
  ITEM_FLAGGED: 'item_flagged',
  SYSTEM: 'system',
};

export function createNotification({ userId, type, title, message, link = null }) {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId,
    type,
    title,
    message,
    link,
    read: false,
    createdAt: new Date().toISOString(),
  };
}

export function getNotificationIcon(type) {
  const icons = {
    match: 'Sparkles',
    claim_submitted: 'FileText',
    claim_approved: 'CheckCircle',
    claim_rejected: 'XCircle',
    report_submitted: 'Send',
    new_claim: 'Bell',
    item_flagged: 'AlertTriangle',
    system: 'Info',
  };
  return icons[type] || 'Bell';
}

export function getNotificationColor(type) {
  const colors = {
    match: 'text-brand-purple-light',
    claim_submitted: 'text-electric-400',
    claim_approved: 'text-emerald-400',
    claim_rejected: 'text-red-400',
    report_submitted: 'text-electric-400',
    new_claim: 'text-amber-400',
    item_flagged: 'text-red-400',
    system: 'text-slate-400',
  };
  return colors[type] || 'text-slate-400';
}

export function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
