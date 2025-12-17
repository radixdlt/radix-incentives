export default function PageHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="font-bold text-2xl">{children}</h1>
    </div>
  );
}
