import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import {
  ThemeProvider,
  themeBootstrapScript,
} from "@/components/providers/theme-provider";
import { AppShell } from "@/components/templates/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sala de Jogos",
    template: "%s · Sala de Jogos",
  },
  description:
    "Jogos de grupo para jogar junto em um aparelho só: impostor, mímica e mais.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider delayDuration={150}>
            <AppShell>{children}</AppShell>
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
