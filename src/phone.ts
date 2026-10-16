// Phone / WhatsApp numbers on the enquiry form (checked in the browser and again on the server).
// Indian numbers: exactly 10 digits starting 6–9, with an optional +91 / 91 / 0 prefix → saved as "+91 98765 43210".
// Other countries: must start with "+" and the country code, 8–15 digits in total → saved as "+<digits>".
export const phoneHint = 'Indian mobile: 10 digits, e.g. 98765 43210. Outside India: start with + and the country code.';
export const phoneError = 'Please enter a valid 10-digit mobile number (e.g. 98765 43210), or + and the country code for numbers outside India.';

export function normalizePhone(input: string): string | null {
  const raw = input.trim();
  if (!/^[+0-9() .-]{7,24}$/.test(raw) || raw.indexOf('+') > 0) return null;
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+') && !digits.startsWith('91')) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  let local = digits;
  if (local.length === 12 && local.startsWith('91')) local = local.slice(2);
  else if (local.length === 11 && local.startsWith('0')) local = local.slice(1);
  return /^[6-9]\d{9}$/.test(local) ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : null;
}
