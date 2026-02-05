import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { QueryProvider } from "@/components/providers/query-provider";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { fetchShop } from "@/lib/graphql/server";
import { themeConfig } from "@/lib/theme/theme-config";

const inter = Inter({ subsets: ["latin"] });

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "My Store";

export const metadata: Metadata = {
  title: `${siteName} - E-commerce Store`,
  description: "Welcome to our online store powered by DoSwiftly Commerce",
};

// Enable ISR with 60 second revalidation for shop data (currencies)
export const revalidate = 60;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch shop data (includes currencies) for CurrencyProvider
  const shopData = await fetchShop();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute={themeConfig.attribute}
          defaultTheme={themeConfig.defaultTheme}
          enableSystem={themeConfig.enableSystem}
          disableTransitionOnChange={themeConfig.disableTransitionOnChange}
          storageKey={themeConfig.storageKey}
        >
          <QueryProvider>
            <CurrencyProvider shopData={shopData.shop}>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster position="bottom-right" richColors />
            </CurrencyProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
