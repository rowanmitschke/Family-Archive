const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const albumsDir = path.join(__dirname, 'albums');

fs.readdirSync(albumsDir, { withFileTypes: true }).forEach(entry => {
  if (entry.isDirectory()) {
    const albumName = entry.name;
    const albumPath = path.join(albumsDir, albumName);
    const inputCSV = path.join(albumPath, 'album-metadata.csv');
    const outputJSON = path.join(albumPath, 'metadata.json');

    if (!fs.existsSync(inputCSV)) {
      console.warn(`⚠️ No CSV found in: ${albumName}, skipping...`);
      return;
    }

    const results = [];
    fs.createReadStream(inputCSV)
      .pipe(csv())
      .on('data', (row) => {
        results.push({
          src: row.src?.trim(),
          tags: {
            date: row.date || "",
            decade: row.decade || "",
            surname: row.surname || "",
            people: row.people ? row.people.split(',').map(p => p.trim()) : []
          },
          description: row.description || ""
        });
      })
      .on('end', () => {
        fs.writeFileSync(outputJSON, JSON.stringify(results, null, 2));
        console.log(`✅ Created metadata.json in: albums/${albumName}/`);
      });
  }
});
