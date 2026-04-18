import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./_component/Navbar";

export const metadata: Metadata = {
  title: "Privileged Access Manager",
  description: "Manage and control access to privileged resources",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
