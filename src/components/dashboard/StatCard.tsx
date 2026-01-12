import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'accent';
  delay?: number;
}

const variantStyles = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
  accent: 'bg-accent/10 text-accent',
};

export const StatCard = ({ title, value, icon: Icon, variant = 'primary', delay = 0 }: StatCardProps) => {
  return (
    <Card 
      className="opacity-0 animate-fade-in border-0 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className={cn('w-14 h-14 rounded-full flex items-center justify-center mb-4', variantStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
};
