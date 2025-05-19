// app/layout.tsx
import './globals.css'; // Stays the same
import type { Metadata } from 'next'; // Stays the same
import { Work_Sans, Raleway } from 'next/font/google'; // Stays the same
import { ThemeProvider } from '@/components/theme-provider'; // Assuming this is from next-themes or similar
import { Toaster } from '@/components/ui/toaster'; // Stays the same

// Font definitions stay the same
const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
});

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
});

// Metadata stays the same
export const metadata: Metadata = {
  title: 'RFP Response Assistant - Everstream Analytics',
  description: 'AI-powered tool for generating RFP responses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning> {/* suppressHydrationWarning is good to keep with next-themes */}
      <body className={`${workSans.variable} ${raleway.variable} font-work-sans`}> {/* Body classes for fonts stay the same */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // Keep this, but forcedTheme will override for now
          // enableSystem={true} // You can comment this out or set to false for debugging
          forcedTheme="light" // <<<< THIS IS THE KEY ADDITION/CHANGE to force light mode
          disableTransitionOnChange // Stays the same
        >
          {children}
          <Toaster /> {/* Stays the same */}
        </ThemeProvider>
      </body>
    </html>
  );
}