import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: DivProps) {
  return (
    <div
      className={
        "rounded-2xl border bg-white shadow-sm " +
        "border-gray-200 " + className
      }
      {...props}
    />
  );
}

export function CardContent({ className = "", ...props }: DivProps) {
  return <div className={"p-6 " + className} {...props} />;
}

// もし他でも使うなら↓も追加できます
export function CardHeader({ className = "", ...props }: DivProps) {
  return <div className={"p-6 pb-0 " + className} {...props} />;
}
export function CardTitle({ className = "", ...props }: DivProps) {
  return <h3 className={"text-xl font-semibold " + className} {...props} />;
}
export function CardDescription({ className = "", ...props }: DivProps) {
  return <p className={"text-sm text-gray-500 " + className} {...props} />;
}
