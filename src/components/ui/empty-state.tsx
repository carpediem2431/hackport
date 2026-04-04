import { Inbox } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <Card className="bg-white/92">
      <div className="flex items-start gap-4">
        <Icon className="mt-0.5 h-5 w-5 text-muted" />
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </Card>
  );
}
