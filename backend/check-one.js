const Database = require('better-sqlite3');
const db = new Database('prisma/dev.db');
const rows = db.prepare("SELECT title, summary, language FROM Book WHERE title = 'Grit' OR originalTitle = 'Grit'").all();
console.log(JSON.stringify(rows, null, 2));
db.close();
