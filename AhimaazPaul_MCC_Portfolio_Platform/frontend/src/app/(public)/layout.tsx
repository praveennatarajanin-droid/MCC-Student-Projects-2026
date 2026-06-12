// Route group layout — passthrough only.
// Prevents /student/[username] from being wrapped by the
// authenticated /student/layout.tsx sidebar shell.
export default function PublicGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
