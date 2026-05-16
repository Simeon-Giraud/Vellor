const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const targetDirs = [
  'app/api',
  'app/dashboard'
];

targetDirs.forEach(dir => {
  walkDir(dir, (filePath) => {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Remove Clerk imports
    content = content.replace(/import\s+\{.*auth.*\}\s+from\s+['"]@clerk\/nextjs(?:\/server)?['"];?/g, '');
    content = content.replace(/import\s+\{.*currentUser.*\}\s+from\s+['"]@clerk\/nextjs(?:\/server)?['"];?/g, '');
    content = content.replace(/import\s+type\s+\{.*User.*\}\s+from\s+['"]@clerk\/nextjs\/server['"];?/g, '');
    
    // Add Supabase auth import if we need it
    if (original.includes('auth()') || original.includes('currentUser()')) {
      content = `import { getCurrentDbUser } from "@/lib/auth";\n` + content;
    }

    // Replace auth() logic
    // const { userId } = await auth()
    content = content.replace(/const\s+\{\s*userId\s*\}\s*=\s*await\s+auth\(\);?/g, 
      `const dbUser = await getCurrentDbUser();\n  const userId = dbUser?.supabaseId;`);
    
    // Replace auth() sync logic (just in case)
    content = content.replace(/const\s+\{\s*userId\s*\}\s*=\s*auth\(\);?/g, 
      `const dbUser = await getCurrentDbUser();\n  const userId = dbUser?.supabaseId;`);

    // Replace currentUser() logic
    content = content.replace(/const\s+clerkUser\s*=\s*await\s+currentUser\(\);?/g,
      `const clerkUser = await getCurrentDbUser(); // Note: clerkUser is now dbUser`);

    // In projects/route.ts, we had specific Clerk code
    if (filePath.includes('projects/route.ts')) {
      content = content.replace(/clerkId/g, 'supabaseId');
    }

    // specific replacement for getDashboardData(clerkId) -> getDashboardData(supabaseId)
    content = content.replace(/clerkId:\s*userId/g, 'supabaseId: userId');
    content = content.replace(/clerkId:\s*string/g, 'supabaseId: string');

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated', filePath);
    }
  });
});
