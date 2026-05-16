const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf-8');

// Remove "use client";
content = content.replace(/"use client";\n*/g, '');

// Remove Clerk imports
content = content.replace(/import \{ SignInButton, SignUpButton, UserButton \} from "@clerk\/nextjs";\n*/g, '');
content = content.replace(/import \{ useAuth \} from "@clerk\/nextjs";\n*/g, '');

// Add auth import
content = content.replace(/import Link from "next\/link";/, 'import Link from "next/link";\nimport { getCurrentDbUser } from "@/lib/auth";');

// Make component async and use getCurrentDbUser
content = content.replace(/export default function HomePage\(\) \{/, 'export default async function HomePage() {');
content = content.replace(/const \{ isSignedIn \} = useAuth\(\);/, 'const dbUser = await getCurrentDbUser();\n  const isSignedIn = !!dbUser;');

// Replace UserButton and SignInButton/SignUpButton with Links
content = content.replace(/<UserButton \/>/g, '<Link href="/dashboard/settings" className="px-3 py-2 text-sm text-[var(--color-fg-muted)] hover:text-white transition-colors duration-[160ms] cursor-pointer">Profile</Link>');

content = content.replace(/<SignInButton mode="modal">\s*([\s\S]*?)<\/SignInButton>/g, '<Link href="/sign-in">$1</Link>');
content = content.replace(/<SignUpButton mode="modal">\s*([\s\S]*?)<\/SignUpButton>/g, '<Link href="/sign-up">$1</Link>');

fs.writeFileSync('app/page.tsx', content);
console.log("Updated app/page.tsx");
