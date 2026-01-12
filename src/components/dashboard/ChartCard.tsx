import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const ChartCard = ({ 
  title, 
  icon: Icon, 
  iconColor = 'text-primary bg-primary/10', 
  children, 
  className,
  delay = 0 
}: ChartCardProps) => {
  return (
    <Card 
      className={cn(
        'opacity-0 animate-fade-in border-0 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-border/50">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
};
