import fs from 'fs';

const file = 'backend/setup-database.js';
let content = fs.readFileSync(file, 'utf8');

// Fix the donations table - missing closing parenthesis
content = content.replace(
  '    FOREIGN KEY (donation_type_id) REFERENCES donation_types (id)\n  `);',
  '    FOREIGN KEY (donation_type_id) REFERENCES donation_types (id)\n  )`);'
);

fs.writeFileSync(file, content);
console.log('✅ Fixed SQL syntax!');
