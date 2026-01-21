import fs from 'fs';

const file = 'backend/setup-database.js';
let content = fs.readFileSync(file, 'utf8');

// Fix the donations table - closing parenthesis should come before backtick
content = content.replace(
  '    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (donation_type_id) REFERENCES donation_types (id)\n  `);',
  '    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (donation_type_id) REFERENCES donation_types (id)\n  )`);'
);

fs.writeFileSync(file, content);
console.log('✅ Fixed SQL syntax - donations table closing!');
