import { LucideIcon, Clock, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Status = 'aguardando_entrada' | 'trabalhando' | 'aguardando_saida' | 'finalizado' | 'nao_registrado';

interface StatusBadgeCardProps {
  status: Status;
  delay?: number;
}

const statusConfig: Record<Status, { label: string; variant: string; icon: LucideIcon; bgColor: string }> = {
  aguardando_entrada: {
    label: 'Aguardando entrada',
    variant: 'bg-warning text-warning-foreground',
    icon: Clock,
    bgColor: 'bg-warning/10 text-warning',
  },
  trabalhando: {
    label: 'Trabalhando',
    variant: 'bg-success text-success-foreground',
    icon: CheckCircle,
    bgColor: 'bg-success/10 text-success',
  },
  aguardando_saida: {
    label: 'Aguardando saída',
    variant: 'bg-info text-info-foreground',
    icon: UserCheck,
    bgColor: 'bg-info/10 text-info',
  },
  finalizado: {
    label: 'Finalizado',
    variant: 'bg-primary text-primary-foreground',
    icon: CheckCircle,
    bgColor: 'bg-primary/10 text-primary',
  },
  nao_registrado: {
    label: 'Não registrado',
    variant: 'bg-muted text-muted-foreground',
    icon: AlertTriangle,
    bgColor: 'bg-muted text-muted-foreground',
  },
};

export const StatusBadgeCard = ({ status, delay = 0 }: StatusBadgeCardProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card 
      className="opacity-0 animate-fade-in border-0 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className={cn('w-14 h-14 rounded-full flex items-center justify-center mb-4', config.bgColor)}>
          <Icon className="w-6 h-6" />
        </div>
        <Badge className={cn('px-4 py-1.5 text-sm font-medium', config.variant)}>
          {config.label}
        </Badge>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3">
          Seu Ponto Hoje
        </p>
      </CardContent>
    </Card>
  );
};
