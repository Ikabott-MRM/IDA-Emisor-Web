import {Roboto} from "next/font/google";
import type {Metadata} from "next";
import "./globals.css";

const roboto = Roboto({subsets: ["latin"], weight: ["400", "500", "700"]});

export const metadata: Metadata = {
  title: "PROD - Portal Emisor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
