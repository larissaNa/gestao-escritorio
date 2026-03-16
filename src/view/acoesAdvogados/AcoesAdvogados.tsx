import React from 'react';
import { Search, Filter, Gavel, User, CheckCircle2, Clock } from 'lucide-react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table';
import { Badge } from '@/view/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/view/components/ui/alert';
import { Atendimento } from '@/model/entities';
import { useAcoesAdvogadosViewModel } from '@/viewmodel/acoesAdvogados/useAcoesAdvogadosViewModel';

const AcoesAdvogados: React.FC = () => {
  const {
    loading,
    error,
    updatingId,

    searchTerm,
    setSearchTerm,
    filtroAdvogado,
    filtroSituacao,
    handleFiltroChange,
    limparFiltros,

    advogados,
    totalRepassados,
    atendimentosEmAndamento,
    atendimentosFinalizados,
    totalAdvogados,

    atendimentosFiltrados,
    statusOptions,
    formatarData,
    getStatusLabel,
    getStatusVariant,
    handleChangeStatus,
  } = useAcoesAdvogadosViewModel();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ações dos Advogados"
        description="Lista de atendimentos/casos repassados para cada advogado."
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-card">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-muted-foreground">Total de atendimentos repassados</p>
              <p className="text-2xl font-semibold">{totalRepassados}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Gavel className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-muted-foreground">Em andamento</p>
              <p className="text-2xl font-semibold">{atendimentosEmAndamento}</p>
            </div>
            <div className="rounded-full bg-amber-100 p-3 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-muted-foreground">Finalizadas</p>
              <p className="text-2xl font-semibold">{atendimentosFinalizados}</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-muted-foreground">Advogados com casos repassados</p>
              <p className="text-2xl font-semibold">{totalAdvogados}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <User className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Filter className="w-4 h-4" />
              Filtros
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={limparFiltros}
              className="text-muted-foreground hover:text-foreground"
            >
              Limpar filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Buscar</span>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, advogado ou área..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Advogado</span>
              <Select
                value={filtroAdvogado}
                onValueChange={(value) => handleFiltroChange({ advogado: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os advogados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {advogados.map((nome) => (
                    <SelectItem key={nome} value={nome}>
                      {nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Situação</span>
              <Select
                value={filtroSituacao}
                onValueChange={(value) =>
                  handleFiltroChange({ situacao: value as 'todas' | Atendimento['status'] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as situações" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Tipo Procedimento</TableHead>
                  <TableHead>Tipo Ação</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Advogado</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && atendimentosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      Carregando atendimentos repassados...
                    </TableCell>
                  </TableRow>
                )}

                {!loading && atendimentosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      Nenhum atendimento repassado encontrado com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}

                {atendimentosFiltrados.map((atendimento) => (
                  <TableRow key={atendimento.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>{formatarData(atendimento.dataAtendimento)}</TableCell>
                    <TableCell className="font-medium">{atendimento.clienteNome}</TableCell>
                    <TableCell>{atendimento.clienteCpf}</TableCell>
                    <TableCell>{atendimento.tipoProcedimento}</TableCell>
                    <TableCell>{atendimento.tipoAcao}</TableCell>
                    <TableCell>{atendimento.cidade}</TableCell>
                    <TableCell>{atendimento.advogadoResponsavel}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={getStatusVariant(atendimento.status)}>
                          {getStatusLabel(atendimento.status)}
                        </Badge>
                        <Select
                          value={atendimento.status}
                          onValueChange={value =>
                            handleChangeStatus(
                              atendimento,
                              value as Atendimento['status'],
                            )
                          }
                          disabled={updatingId === atendimento.id}
                        >
                          <SelectTrigger className="h-8 w-[150px] text-xs">
                            <SelectValue placeholder="Alterar status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="em_andamento">
                              Em andamento
                            </SelectItem>
                            <SelectItem value="finalizado">Finalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcoesAdvogados;
