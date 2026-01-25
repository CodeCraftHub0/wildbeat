import fs from 'fs';

const file = 'backend/setup-database.js';
let content = fs.readFileSync(file, 'utf8');

// Fix the donations table - literal `n should be actual newline
const broken = 'FOREIGN KEY (donation_type_id) REFERENCES donation_types (id)`n  )`);';
const fixed = `FOREIGN KEY (donation_type_id) REFERENCES donation_types (id)
  )\`);`;

content = content.replace(broken, fixed);

fs.writeFileSync(file, content);
console.log('✅ Fixed!');
