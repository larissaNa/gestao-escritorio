import React from 'react';
import { Plus, Users, CheckCircle2, Clock, AlertTriangle, Eye, Pencil, Trash2, Route } from 'lucide-react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Card, CardContent } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Badge } from '@/view/components/ui/badge';
import { Input } from '@/view/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table';
import { StatCard } from '@/view/components/dashboard/StatCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/view/components/ui/alert-dialog';
import { useCaminhoClienteViewModel } from '@/viewmodel/caminhoCliente/useCaminhoClienteViewModel';
import {
  ETAPAS_CAMINHO,
  SITUACOES_CAMINHO,
  SetorResponsavel,
} from '@/model/entities';
import { caminhoClienteService } from '@/model/services/caminhoClienteService';

const SETORES: SetorResponsavel[] = [
  'Comercial',
  'Recepção',
  'Triagem Jurídica',
  'Jurídico',
  'INSS',
  'Controladoria',
  'Advogado',
  'Financeiro',
  'Arquivo',
];

const CaminhoClienteLista = () => {
  const {
    caminhos,
    loading,
    searchTerm,
    setSearchTerm,
    filterEtapa,
    setFilterEtapa,
    filterSituacao,
    setFilterSituacao,
    filterSetor,
    setFilterSetor,
    resumo,
    handleNew,
    handleEdit,
    handleTimeline,
    deleteId,
    confirmDelete,
    cancelDelete,
    executeDelete,
  } = useCaminhoClienteViewModel();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Caminho do Cliente"
        description="Acompanhe em que etapa cada cliente está — do cadastro ao encerramento."
      >
        <Button onClick={handleNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </PageHeader>

      <div className="max-w-[1600px] mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total" value={resumo.total} icon={Users} variant="primary" delay={0} />
          <StatCard title="Concluídos" value={resumo.concluidos} icon={CheckCircle2} variant="success" delay={80} />
          <StatCard title="Parados +7d" value={resumo.parados7d} icon={Clock} variant="warning" delay={160} />
          <StatCard title="Parados +15d" value={resumo.parados15d} icon={AlertTriangle} variant="accent" delay={240} />
        </div>

        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Buscar cliente, CPF, processo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={filterEtapa} onValueChange={(v) => setFilterEtapa(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Etapas</SelectItem>
              {ETAPAS_CAMINHO.map((e) => (
                <SelectItem key={e.key} value={e.key}>
                  {e.ordem}. {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSituacao} onValueChange={(v) => setFilterSituacao(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Situação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Situações</SelectItem>
              {SITUACOES_CAMINHO.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.emoji} {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSetor} onValueChange={(v) => setFilterSetor(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Setor Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Setores</SelectItem>
              {SETORES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Cliente</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Etapa Atual</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Próxima Ação</TableHead>
                  <TableHead>Última Movim.</TableHead>
                  <TableHead>Parado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caminhos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {caminhos.map((c) => {
                  const etapaMeta = ETAPAS_CAMINHO.find((e) => e.key === c.etapaAtual);
                  const situacaoMeta = SITUACOES_CAMINHO.find((s) => s.key === c.situacao);
                  const dias = caminhoClienteService.diasParado(c);
                  const diasClass =
                    dias >= 30
                      ? 'text-red-600 font-semibold'
                      : dias >= 15
                      ? 'text-orange-600 font-semibold'
                      : dias >= 7
                      ? 'text-yellow-600 font-semibold'
                      : 'text-muted-foreground';

                  return (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer hover:bg-muted/20"
                      onClick={() => c.id && handleTimeline(c.id)}
                    >
                      <TableCell className="font-medium">{c.clienteNome}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.clienteCpf}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Route className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm">
                            {etapaMeta ? `${etapaMeta.ordem}. ${etapaMeta.label}` : c.etapaAtual}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {situacaoMeta ? (
                          <Badge variant="outline" className={situacaoMeta.color}>
                            {situacaoMeta.emoji} {situacaoMeta.label}
                          </Badge>
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{c.setorResponsavel}</TableCell>
                      <TableCell className="text-sm">{c.responsavelAtual || '-'}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate" title={c.proximaAcao}>
                        {c.proximaAcao || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.dataUltimaMovimentacao?.toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className={`text-sm ${diasClass}`}>{dias}d</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver timeline"
                            onClick={(e) => {
                              e.stopPropagation();
                              c.id && handleTimeline(c.id);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar"
                            onClick={(e) => {
                              e.stopPropagation();
                              c.id && handleEdit(c.id);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Excluir"
                            onClick={(e) => {
                              e.stopPropagation();
                              c.id && confirmDelete(c.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CaminhoClienteLista;
