interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export default function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="space-y-1 animate__animated animate__fadeIn">
      <h1 className="font-serif text-3xl font-bold text-[#32130E] capitalize tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[#7A5C55] text-xs font-medium">{subtitle}</p>
      )}
    </div>
  );
}
