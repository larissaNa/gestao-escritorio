import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/view/components/ui/card';
import { Badge } from '@/view/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/view/components/ui/table';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  icon: LucideIcon;
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  count?: number;
  delay?: number;
}

export function DataTable<T extends { id?: string }>({
  title,
  icon: Icon,
  data,
  columns,
  emptyMessage = 'Nenhum dado disponível',
  count,
  delay = 0,
}: DataTableProps<T>) {
  return (
    <Card 
      className="opacity-0 animate-fade-in border-0 shadow-card hover:shadow-card-hover transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-border/50">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-foreground">
          {title} {count !== undefined && <span className="text-muted-foreground">({count})</span>}
        </h3>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                {columns.map((col) => (
                  <TableHead key={String(col.key)} className="font-semibold text-foreground/80">
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id || index} className="hover:bg-muted/20 transition-colors">
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export const StatusBadge = ({ status, type }: { status: string; type: 'success' | 'warning' | 'info' | 'muted' }) => {
  const variants = {
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    info: 'bg-info/10 text-info border-info/20',
    muted: 'bg-muted text-muted-foreground border-muted',
  };

  return (
    <Badge variant="outline" className={cn('font-medium', variants[type])}>
      {status}
    </Badge>
  );
};

