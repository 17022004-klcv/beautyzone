import { ReactNode } from "react";

export default function HorizontalScrollGrid({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
      {children}
    </div>
  );
}
