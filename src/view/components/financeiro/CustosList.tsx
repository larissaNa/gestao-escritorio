import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/view/components/ui/table";
import { Badge } from "@/view/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/view/components/ui/card";
import { CustoServico } from "@/model/entities";

interface CustosListProps {
  custos: CustoServico[];
  loading: boolean;
}

export function CustosList({ custos, loading }: CustosListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custos do Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custos do Serviço</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Recorrente</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {custos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Nenhum custo registrado.
                </TableCell>
              </TableRow>
            ) : (
              custos.map((custo) => (
                <TableRow key={custo.id}>
                  <TableCell className="font-medium">{custo.descricao}</TableCell>
                  <TableCell className="capitalize">{custo.categoria}</TableCell>
                  <TableCell>{formatDate(custo.data)}</TableCell>
                  <TableCell>{formatCurrency(custo.valor)}</TableCell>
                  <TableCell>
                    {custo.recorrente ? (
                      <Badge variant="outline">Sim</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Não</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


