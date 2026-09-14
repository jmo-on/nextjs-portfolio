import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Jin Hong Moon",
  description: "Jin Hong Moon — software, machine learning, and a little space exploration. Fly a star collector, explore the moon, and rescue floating travelers.",
  icons: { icon: '/favicon.ico' }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
