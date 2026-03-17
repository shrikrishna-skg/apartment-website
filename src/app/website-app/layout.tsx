export default function WebAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout replaces the root layout's Navbar/Footer for all /website-app routes.
  // The root layout.tsx wraps this, but we just render children without any site chrome.
  return <>{children}</>;
}
