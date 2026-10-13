export const MAX_NAME_LENGTH = 80;
export function normalizeName(value) { return String(value ?? '').normalize('NFC').replace(/\s+/gu, ' ').trim(); }
export function validateName(value, language) {
  const name = normalizeName(value);
  if(!['ar','en'].includes(language))return {name,error:'badLanguage'};
  if (!name) return { name, error: 'empty' };
  if (Array.from(name).length > MAX_NAME_LENGTH) return { name, error: 'length' };
  const arabic = /\p{Script_Extensions=Arabic}/u, latin = /\p{Script_Extensions=Latin}/u;
  const script = language === 'ar' ? /[\p{Script_Extensions=Arabic}\p{Script_Extensions=Latin}]/u : latin;
  let letters = 0, previousLetter = false;
  for (const char of name) {
    if(/[\u034f\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/u.test(char))return {name,error:'characters'};
    if (/\p{L}/u.test(char)) {
      if (!script.test(char)) return { name, error: 'script' };
      if(char!=='ـ')letters++; previousLetter = latin.test(char) ? 'latin' : 'arabic';
    } else if (/\p{M}/u.test(char)) {
      const validMark = previousLetter === 'arabic' ? arabic.test(char) : latin.test(char) || /\p{Script_Extensions=Inherited}/u.test(char);
      if (!previousLetter || !validMark) return { name, error: 'script' };
    } else if (/^[ .'’\-]$/u.test(char)) previousLetter = false;
    else return { name, error: 'characters' };
  }
  return { name, error: letters ? null : 'letters' };
}
export function parseLanguage(value, fallback) {
  const text = String(value ?? '').trim().toLowerCase();
  if (!text) return fallback;
  if (['ar', 'arabic', 'العربية', 'عربي'].includes(text)) return 'ar';
  if (['en', 'english', 'الإنجليزية', 'الانجليزية'].includes(text)) return 'en';
  return null;
}
export function fileName(name, language, index) {
  const safe = normalizeName(name).replace(/[^\p{L}\p{M}\p{N} .’'-]/gu, '').replace(/\s+/gu, '-').slice(0, 100) || 'invitation';
  return `${index === undefined ? '' : String(index + 1).padStart(3, '0') + '-'}ARPA-${language}-${safe}.png`;
}
export function importRows(matrix, fallback) {
  const first = matrix.findIndex(row => row.some(cell => String(cell ?? '').trim()));
  if (first < 0) throw new Error('emptyWorkbook');
  const headers = matrix[first].map(cell => String(cell ?? '').trim().toLowerCase());
  const nameIndex = headers.findIndex(header => ['name', 'الاسم', 'اسم'].includes(header));
  const languageIndex = headers.findIndex(header => ['language', 'اللغة', 'لغة'].includes(header));
  if (nameIndex < 0) throw new Error('missingColumn');
  const rows = [];
  for (let i = first + 1; i < matrix.length; i++) {
    const row = matrix[i];
    if (!row.some(cell => String(cell ?? '').trim())) continue;
    rows.push({ id: i + 1, name: String(row[nameIndex] ?? ''), language: parseLanguage(languageIndex < 0 ? '' : row[languageIndex], fallback), originalLanguage: languageIndex < 0 ? '' : String(row[languageIndex] ?? '') });
  }
  if (!rows.length) throw new Error('emptyWorkbook');
  if (rows.length > 500) throw new Error('tooManyRows');
  return rows;
}
