import 'leaflet/dist/leaflet.css';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/store/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pravaah 360 — One App. Complete Safety. Zero Delays.",
  description:
    "Unified public safety and urban emergency response platform for Vijayawada, Andhra Pradesh: emergency dispatch, urban flood intelligence, blood network, women & child safety and the Service Provider response fleet.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
