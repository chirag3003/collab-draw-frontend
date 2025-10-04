interface ProjectLayoutProps {
  children: React.ReactNode;
}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  return (
    <div className="fixed inset-0 bg-white overflow-hidden">{children}</div>
  );
}
