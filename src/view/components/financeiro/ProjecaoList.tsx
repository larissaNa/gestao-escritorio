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
import { ProjecaoFinanceira } from "@/model/entities";

interface ProjecaoListProps {
  projecoes: ProjecaoFinanceira[];
  loading: boolean;
}

export function ProjecaoList({ projecoes, loading }: ProjecaoListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const getProbabilidadeBadge = (probabilidade: ProjecaoFinanceira['probabilidade']) => {
    switch (probabilidade) {
      case 'alta':
        return <Badge className="bg-green-500 hover:bg-green-600">Alta</Badge>;
      case 'media':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Média</Badge>;
      case 'baixa':
        return <Badge variant="secondary">Baixa</Badge>;
      default:
        return <Badge variant="outline">{probabilidade}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Honorários</CardTitle>
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
        <CardTitle>Projeção de Honorários</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Data Prevista</TableHead>
              <TableHead>Valor Estimado</TableHead>
              <TableHead>Probabilidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projecoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  Nenhuma projeção encontrada.
                </TableCell>
              </TableRow>
            ) : (
              projecoes.map((projecao) => (
                <TableRow key={projecao.id}>
                  <TableCell className="font-medium">{projecao.descricao}</TableCell>
                  <TableCell>{formatDate(projecao.dataPrevista)}</TableCell>
                  <TableCell>{formatCurrency(projecao.valorEstimado)}</TableCell>
                  <TableCell>{getProbabilidadeBadge(projecao.probabilidade)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


