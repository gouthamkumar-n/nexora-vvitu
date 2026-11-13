import React from 'react';

const statusMap = {
  active:    { cls: 'badge-blue',   label: 'Found / Active' },
  found:     { cls: 'badge-blue',   label: 'Found (At Desk)' },
  returned:  { cls: 'badge-green',  label: 'Taken / Returned' },
  taken:     { cls: 'badge-green',  label: 'Taken'          },
  pending:   { cls: 'badge-yellow', label: 'Pending'        },
  claimed:   { cls: 'badge-yellow', label: 'Claimed'        },
  rejected:  { cls: 'badge-red',    label: 'Rejected'       },
  suspicious:{ cls: 'badge-red',    label: 'Suspicious'     },
  approved:  { cls: 'badge-green',  label: 'Approved'       },
};

export default function Badge({ status }) {
  const key = (status || '').toLowerCase();
  const { cls, label } = statusMap[key] || { cls: 'badge-gray', label: status || 'Unknown' };

  return <span className={`badge ${cls}`}>{label}</span>;
}
