import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
}

export function InfoCard({ title, description, icon: Icon, className }: InfoCardProps) {
  return (
    <Card className={`h-full hover:shadow-lg transition-shadow ${className || ''}`}>
      <CardHeader>
        {Icon && (
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
