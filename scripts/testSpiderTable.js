import https from 'https';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function test() {
  const json = await fetchJson('https://zombicide.fandom.com/api.php?action=parse&page=Spider-Man&prop=wikitext&format=json');
  const wt = json.parse?.wikitext?.['*'] || '';
  const tables = wt.match(/\{\| class="article-table"[\s\S]*?\|\}/gi) || [];
  console.log('Tables count:', tables.length);
  tables.forEach((t, i) => {
    console.log(`\n--- TABLE ${i} ---`);
    console.log(t.slice(0, 500));
  });
}

test();
