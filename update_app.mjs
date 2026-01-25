import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appPath = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Add import
if (!content.includes('AdminDonations')) {
  content = content.replace(
    'import { NotFound } from "@/pages/NotFound"',
    'import { NotFound } from "@/pages/NotFound"\nimport { AdminDonations } from "@/pages/AdminDonations"'
  );
}

// Add route
if (!content.includes('/admin/donations')) {
  content = content.replace(
    '<Route path="/signup" element={<Signup />} />\n                <Route path="*" element={<NotFound />} />',
    '<Route path="/signup" element={<Signup />} />\n                <Route path="/admin/donations" element={<AdminDonations />} />\n                <Route path="*" element={<NotFound />} />'
  );
}

fs.writeFileSync(appPath, content);
console.log('✅ App.tsx updated!');
