import NavbarWrapper from "../components/Navbarwrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#060e0a", minHeight: "100vh" }}>
      {children}
    </div>
  );
}