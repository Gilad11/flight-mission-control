'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UserPlus, Pencil, Archive, BookOpen, Plane, Moon, Sun } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'לוח בקרה' },
  { href: '/add', icon: UserPlus, label: 'הוסף נוסע' },
  { href: '/edit', icon: Pencil, label: 'עריכה וניהול' },
  { href: '/archive', icon: Archive, label: 'ארכיון' },
  { href: '/guide', icon: BookOpen, label: 'מדריך' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('darkMode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <aside className="fixed right-0 top-0 h-full w-16 bg-gray-900 dark:bg-gray-950 flex flex-col items-center py-4 z-50 border-l border-gray-700">
      {/* Logo */}
      <div className="mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Plane className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2 flex-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <div key={href} className="relative" onMouseEnter={() => setHovered(href)} onMouseLeave={() => setHovered(null)}>
              <Link
                href={href}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
              </Link>
              {hovered === href && (
                <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none z-50 border border-gray-700">
                  {label}
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        className="w-10 h-10 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-white flex items-center justify-center transition-all"
        title={dark ? 'מצב בהיר' : 'מצב כהה'}
      >
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </aside>
  );
}
