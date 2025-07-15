import type { Metadata } from "next";
import { Wix_Madefor_Display } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { CartProvider } from "./CartContext";

const wixMadefor = Wix_Madefor_Display({
  variable: "--font-wix-madefor",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Young Coco - Woda kokosowa",
  description: "Naturalna woda kokosowa z młodych, zielonych kokosów. 100% natura, bez cukru i konserwantów. Spróbuj Young Coco i poczuj tropiki w każdym łyku.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${wixMadefor.variable} antialiased bg-white`}>
        <CartProvider>
          <Navbar />
          <div>{children}</div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
