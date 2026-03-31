export function formatDollar(amount: number | null): string {
  if (amount === null) return 'N/A';
  return '$' + amount.toLocaleString('en-US');
}

export function formatIndex(value: number): string {
  return value.toFixed(1);
}

export function formatPctDiff(value: number): string {
  const diff = value - 100;
  if (diff > 0) return `${diff.toFixed(1)}% above`;
  if (diff < 0) return `${Math.abs(diff).toFixed(1)}% below`;
  return 'at';
}

export function formatPctDiffShort(value: number): string {
  const diff = value - 100;
  if (diff > 0) return `+${diff.toFixed(1)}%`;
  if (diff < 0) return `${diff.toFixed(1)}%`;
  return '0%';
}

export function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    all: 'Overall',
    housing: 'Housing',
    goods: 'Goods',
    utilities: 'Utilities',
    other_services: 'Other Services',
  };
  return labels[cat] || cat;
}

export function getDataYear(): number {
  return 2024;
}
