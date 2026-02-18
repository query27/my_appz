import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import NavbarWrapper from "./components/Navbarwrapper";

export const metadata: Metadata = {
  title: "GentleChase",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NavbarWrapper>
          <Navbar />
        </NavbarWrapper>
        {children}
      </body>
    </html>
  );
}