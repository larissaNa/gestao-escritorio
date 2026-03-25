import { useMemo } from 'react';
import { History, Loader2, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table';
import { useFechamentosAtendimentos } from '@/viewmodel/atendimentos/useFechamentosAtendimentosViewModel';

const formatDate = (d: Date) =>
  Number.isFinite(d.getTime()) && d.getTime() > 0 ? d.toLocaleDateString('pt-BR') : '-';

const formatPercent = (value: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value) + '%';

const FechamentosAtendimentos = () => {
  const { loading, error, totalAtendimentos, totalFechados, taxaConversao, clientesFechados } =
    useFechamentosAtendimentos();

  const conversionLabel = useMemo(() => formatPercent(taxaConversao), [taxaConversao]);

  return (
    <div className="space-y-6">
      <PageHeader title="Fechamentos" description="Clientes com contrato fechado e taxa de conversão">
        <Button asChild variant="outline" className="gap-2">
          <Link to="/atendimentos">
            <Users className="w-4 h-4" />
            Ver atendimentos
          </Link>
        </Button>
      </PageHeader>

      {loading ? (
        <Card>
          <CardContent className="py-12 flex justify-center items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Carregando...
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-destructive">{error}</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardDescription>Total de atendimentos</CardDescription>
                <CardTitle className="text-3xl">{totalAtendimentos}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardDescription>Fechados com contrato</CardDescription>
                <CardTitle className="text-3xl">{totalFechados}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardDescription>Conversão (Atendimento → Contrato)</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  {conversionLabel}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Clientes com contrato fechado</CardTitle>
              <CardDescription>Lista agregada por CPF (último fechamento primeiro)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold w-40">Último fechamento</TableHead>
                      <TableHead className="font-semibold min-w-64">Cliente</TableHead>
                      <TableHead className="font-semibold w-44">CPF</TableHead>
                      <TableHead className="font-semibold w-44">Telefone</TableHead>
                      <TableHead className="font-semibold w-40">Cidade</TableHead>
                      <TableHead className="font-semibold min-w-52">Responsável</TableHead>
                      <TableHead className="font-semibold w-32 text-right">Qtde</TableHead>
                      <TableHead className="font-semibold w-40" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientesFechados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          Nenhum contrato fechado encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      clientesFechados.map((c) => (
                        <TableRow key={c.clienteCpf}>
                          <TableCell className="text-muted-foreground">{formatDate(c.ultimoFechamento)}</TableCell>
                          <TableCell className="font-medium">{c.clienteNome}</TableCell>
                          <TableCell>{c.clienteCpf}</TableCell>
                          <TableCell>{c.clienteTelefone}</TableCell>
                          <TableCell>{c.cidade}</TableCell>
                          <TableCell className="truncate">{c.responsavel}</TableCell>
                          <TableCell className="text-right">{c.totalFechamentos}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm" variant="outline" className="gap-2">
                              <Link to={`/atendimentos/historico/${encodeURIComponent(c.clienteCpf)}`}>
                                <History className="w-4 h-4" />
                                Histórico
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FechamentosAtendimentos;

