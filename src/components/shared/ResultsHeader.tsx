type ResultsHeaderProps = { title: string; count: number };

export function ResultsHeader({ title, count }: ResultsHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between">
      <h2 className="text-xl font-bold">{title}</h2>
      <span className="text-sm font-bold">Encontrados: {count}</span>
    </div>
  );
}
