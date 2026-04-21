export const parseApiDate = (value) => {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  const dateOnlyMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDatePtBr = (value) => {
  const date = parseApiDate(value);
  return date ? date.toLocaleDateString('pt-BR') : '-';
};

export const formatDateTimePtBr = (value) => {
  const date = parseApiDate(value);
  return date ? date.toLocaleString('pt-BR') : '-';
};