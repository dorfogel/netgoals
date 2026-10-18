import './globals.css';

export const metadata = {
  title: 'NetGoals - גולים ברשת | מערכת הניחושים הקהילתית',
  description: 'נחשו את תוצאות המשחקים המרכזיים, תתחרו בטבלת המובילים ואתגרו את החברים!',
  metadataBase: new URL('https://netgoals.co.il'),
  openGraph: {
    title: 'NetGoals - גולים ברשת ⚽',
    description: 'מערכת הניחושים הקהילתית • נחשו את תוצאות השבוע והתחרות בלייב!',
    url: 'https://netgoals.co.il',
    siteName: 'NetGoals',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'NetGoals - גולים ברשת',
      },
    ],
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NetGoals - גולים ברשת ⚽',
    description: 'נחשו את תוצאות המשחקים המרכזיים והתחרות בטבלת המובילים!',
    images: ['/api/og'],
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚽</text></svg>',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" className="bg-slate-950 text-slate-100 min-h-screen">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="font-sans antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
