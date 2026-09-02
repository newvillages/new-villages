export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 60) return "à l'instant";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `il y a ${diffHr} h`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `il y a ${diffDay} j`;
  return new Date(iso).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' });
}

