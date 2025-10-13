const BASE_URL = 'https://azkar.ml';

async function safeFetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// NOTE: The public API at azkar.ml may expose different endpoints.
// We provide multiple strategies and fallbacks to maximize compatibility.
export async function getCategories() {
  const candidates = [
    `${BASE_URL}/api/categories`,
    `${BASE_URL}/categories`,
    `${BASE_URL}/api/azkar/categories`,
  ];

  for (const url of candidates) {
    try {
      const data = await safeFetchJson(url);
      // Normalize: expect [{id, name, slug}] or {data:[...]}
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      if (list.length > 0) {
        return list.map((c, i) => ({
          id: c.id ?? i,
          name: c.name ?? c.title ?? 'غير مصنف',
          slug: c.slug ?? c.id ?? `${i}`,
          icon: 'heart-outline',
        }));
      }
    } catch (_) {}
  }

  // Fallback
  return [
    { id: 1, name: 'أذكار الصباح', slug: 'morning', icon: 'sunny-outline' },
    { id: 2, name: 'أذكار المساء', slug: 'evening', icon: 'moon-outline' },
    { id: 3, name: 'أذكار الصلاة', slug: 'prayer', icon: 'praying' },
    { id: 4, name: 'أذكار النوم', slug: 'sleep', icon: 'bed-outline' },
  ];
}

export async function getAzkarByCategory(slug) {
  const candidates = [
    `${BASE_URL}/api/azkar/${encodeURIComponent(slug)}`,
    `${BASE_URL}/azkar/${encodeURIComponent(slug)}`,
    `${BASE_URL}/api/${encodeURIComponent(slug)}`,
  ];

  for (const url of candidates) {
    try {
      const data = await safeFetchJson(url);
      // Normalize: expect array or {data:[...]}
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      if (list.length > 0) {
        return list.map((z, i) => ({
          id: z.id ?? i,
          text: z.text ?? z.content ?? z.dhikr ?? '',
          repeat: z.repeat ?? z.count ?? 1,
          reference: z.reference ?? z.source ?? '',
        }));
      }
    } catch (_) {}
  }

  // Fallback sample
  return [
    { id: 1, text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', repeat: 100, reference: '' },
    { id: 2, text: 'لَا إِلَهَ إِلَّا اللَّهُ', repeat: 100, reference: '' },
  ];
}

export async function searchAzkar(query) {
  const candidates = [
    `${BASE_URL}/api/search?q=${encodeURIComponent(query)}`,
    `${BASE_URL}/search?q=${encodeURIComponent(query)}`,
  ];

  for (const url of candidates) {
    try {
      const data = await safeFetchJson(url);
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      if (list.length > 0) {
        return list.map((z, i) => ({
          id: z.id ?? i,
          text: z.text ?? z.content ?? z.dhikr ?? '',
          repeat: z.repeat ?? z.count ?? 1,
          category: z.category ?? z.section ?? '',
        }));
      }
    } catch (_) {}
  }

  return [];
}

export default {
  getCategories,
  getAzkarByCategory,
  searchAzkar,
};
