const fs = require('fs');
const path = require('path');

const hooksDir = path.join(__dirname, '../hooks');
const files = fs.readdirSync(hooksDir);

files.forEach(file => {
  if (!file.endsWith('.ts') || file === 'useAuth.ts' || file === 'use-mobile.ts' || file === 'useRoles.ts' || file === 'useUsers.ts') {
    return;
  }
  const filePath = path.join(hooksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('fetch(')) {
    content = content.replace(/fetch\(/g, 'fetchClient(');
    if (!content.includes('fetchClient')) {
       // just in case
    }
    content = `import { fetchClient } from "@/lib/fetch-client";\n` + content;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
