import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function StateCard({
  title,
  description,
  loading,
  descriptionClassName,
}: {
  title: string;
  description: string;
  loading?: boolean;
  descriptionClassName?: string;
}) {
  return (
    <Card className="bg-white/92">
      <div className="flex items-start gap-4">
        {loading ? <LoaderCircle className="mt-0.5 h-5 w-5 animate-spin text-brand-strong" /> : null}
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className={cn("mt-2", descriptionClassName)}>{description}</CardDescription>
        </div>
      </div>
    </Card>
  );
}
