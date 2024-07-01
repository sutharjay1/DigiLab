import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import Navbar from "@/components/NavBar";
import Providers from "@/components/Provider";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "relative min-h-full font-sans antialiased",
          inter.className
        )}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            <Navbar />
            {children}

            {/* <Script 
              id="razorpay-checkout-js"
              src="https://checkout.razorpay.com/v1/checkout.js"
            /> */}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
