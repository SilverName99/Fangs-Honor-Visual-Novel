export async function api(cale, optiuni = {}) {
  const r = await fetch(`api/${cale}`, optiuni);
  const tip = r.headers.get('content-type') || '';
  const corp = tip.includes('json') ? await r.json() : await r.text();
  if (!r.ok) throw new Error(corp?.eroare || corp || `Eroare ${r.status}`);
  return corp;
}
