
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const [year, month, day] = birthDate.split('-').map(Number);
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const getNextOccurrence = (birthDate: string): Date => {
  const today = new Date();
  const [_, month, day] = birthDate.split('-').map(Number);
  const next = new Date(today.getFullYear(), month - 1, day);

  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    next.setFullYear(today.getFullYear() + 1);
  }
  return next;
};

export const daysUntil = (date: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = getNextOccurrence(date);
  const diffTime = next.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDateBr = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export const formatShortDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const birth = new Date(year, month - 1, day);
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${birth.getDate()} de ${months[birth.getMonth()]}`;
};

export const formatPhone = (value: string): string => {
  if (!value) return "";
  value = value.replace(/\D/g, ""); // Remove tudo que não é dígito

  if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos

  if (value.length > 10) {
    // Formato (00) 00000-0000
    return value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (value.length > 6) {
    // Formato (00) 0000-0000
    return value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else if (value.length > 2) {
    // Formato (00) 0000
    return value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  } else if (value.length > 0) {
    // Formato (00
    return value.replace(/(\d{0,2})/, "($1");
  }
  return value;
};
