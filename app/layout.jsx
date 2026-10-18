import './globals.css';

export const metadata = {
  title: 'גולים ברשת - netgoals.co.il',
  description: 'מערכת הניחושים הקהילתית של כדורגל ישראלי ועולמי',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-900 text-white min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
