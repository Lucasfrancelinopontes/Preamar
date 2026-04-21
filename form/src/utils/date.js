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

const extractDatePart = (value) => {
  if (!value) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  return raw.includes('T') ? raw.split('T')[0] : raw;
};

const extractTimePart = (value) => {
  if (!value) return '';
  const raw = String(value).trim().replace('Z', '');
  if (!raw) return '';

  if (raw.includes('T')) {
    const time = raw.split('T')[1] || '';
    return time.split('.')[0] || '';
  }

  return raw;
};

export const formatDatePtBr = (value) => {
  const date = parseApiDate(value);
  return date ? date.toLocaleDateString('pt-BR') : '-';
};

export const formatDateTimePtBr = (value, timeValue = null) => {
  if (timeValue !== null && timeValue !== undefined && String(timeValue).trim() !== '') {
    const datePart = extractDatePart(value);
    const timePart = extractTimePart(timeValue);

    if (datePart && timePart) {
      const formattedDate = formatDatePtBr(datePart);
      return formattedDate === '-' ? '-' : `${formattedDate}, ${timePart}`;
    }
  }

  const date = parseApiDate(value);
  return date ? date.toLocaleString('pt-BR') : '-';
};