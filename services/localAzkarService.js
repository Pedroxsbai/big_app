import data from '../azkar.json';

function normalize() {
  // data is a map: {categoryName: array}
  const categories = [];
  const itemsBySlug = {};

  Object.keys(data).forEach((catName, index) => {
    const slug = String(index);
    categories.push({ id: index, name: catName, slug, icon: 'bookmark-outline' });
    const arr = data[catName] || [];
    // Some entries are arrays wrapping objects as first element; flatten
    const flat = [];
    arr.forEach((entry) => {
      if (Array.isArray(entry)) {
        entry.forEach((e) => flat.push(e));
      } else {
        flat.push(entry);
      }
    });
    itemsBySlug[slug] = flat
      .filter(Boolean)
      .map((z, i) => ({
        id: `${slug}-${i}`,
        text: z.content || z.text || '',
        repeat: Number(z.count || z.repeat || 1) || 1,
        reference: z.reference || '',
        category: z.category || catName,
      }));
  });

  return { categories, itemsBySlug };
}

const normalized = normalize();

export async function getCategories() {
  return normalized.categories;
}

export async function getAzkarByCategory(slug) {
  return normalized.itemsBySlug[slug] || [];
}

export async function searchAzkar(query) {
  const q = (query || '').trim();
  if (!q) return [];
  const results = [];
  normalized.categories.forEach((c) => {
    const list = normalized.itemsBySlug[c.slug] || [];
    list.forEach((z) => {
      if (z.text && z.text.includes(q)) results.push(z);
    });
  });
  return results;
}

export default { getCategories, getAzkarByCategory, searchAzkar };
