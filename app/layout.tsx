import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Imprintly – Impressum einfach erstellen",
  description:
    "Eine geführte Demo, die aus einer Website und wenigen Rückfragen einen Impressumsentwurf erstellt.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
