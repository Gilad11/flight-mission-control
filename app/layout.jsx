import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'מרכז בקרת טיסות',
  description: 'מערכת ניהול לוגיסטיקת טיסות',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 mr-16 overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
