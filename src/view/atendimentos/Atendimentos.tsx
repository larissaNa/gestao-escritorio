import { ClipboardList, Plus, Edit2, Trash2, History, Eye, Loader2, Send, AlertTriangle, RotateCcw, FileDown } from 'lucide-react';
import { Card, CardContent } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Badge } from '@/view/components/ui/badge';
import { Label } from '@/view/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/view/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/view/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { DataFilters } from '@/view/components/ui/data-filters';
import { cn } from '@/lib/utils';
import { useAtendimentos } from '@/viewmodel/atendimentos/useAtendimentosViewModel';

import { PageHeader } from '@/view/components/layout/PageHeader';

const Atendimentos = () => {
  const {
    atendimentos,
    responsaveis,
    cidades,
    advogados,
    meses,
    anos,
    statusOptions,
    loading,
    loadingMore,
    hasMore,
    showDetailsModal,
    setShowDetailsModal,
    viewingAtendimento,
    advogadoSelecionado,
    setAdvogadoSelecionado,
    searchTerm,
    setSearchTerm,
    filterResponsavel,
    setFilterResponsavel,
    filterCidade,
    setFilterCidade,
    filterMes,
    setFilterMes,
    filterAno,
    setFilterAno,
    filterStatus,
    setFilterStatus,
    filterPendentesFechamento,
    setFilterPendentesFechamento,
    isRetorno,
    isPendenteFechamento,
    isAlerta7Dias,
    diasDesdeAtendimento,
    carregarMais,
    handleRepassar,
    confirmDelete,
    cancelDelete,
    executeDelete,
    deleteId,
    handleEdit,
    handleFechamento,
    handleNew,
    handleShowHistory,
    handleViewDetails,
  } = useAtendimentos();

  const statusLabel = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'Em andamento';
      case 'aguardando_documentacao':
        return 'Aguardando documentação';
      case 'repassado':
        return 'Repassado';
      case 'fechado_com_contrato':
        return 'Fechado com contrato';
      case 'encerrado_sem_contrato':
        return 'Encerrado sem contrato';
      case 'finalizado':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'fechado_com_contrato':
        return 'bg-success/10 text-success border-success/20';
      case 'encerrado_sem_contrato':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'aguardando_documentacao':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'repassado':
        return 'bg-info/10 text-info border-info/20';
      case 'finalizado':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-accent/10 text-accent border-accent/20';
    }
  };

  const formatDate = (d: Date) => (Number.isFinite(d.getTime()) && d.getTime() > 0 ? d.toLocaleDateString('pt-BR') : '-');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Atendimentos" 
        description="Gerencie os atendimentos do escritório"
      >
        <Button onClick={handleNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Atendimento
        </Button>
      </PageHeader>

      {/* Filters */}
      <DataFilters
          searchPlaceholder="Buscar por nome ou CPF..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              key: 'responsavel',
              label: 'Responsável',
              value: filterResponsavel,
              onChange: setFilterResponsavel,
              options: [
                { value: 'Todos', label: 'Todos' },
                ...responsaveis.map((r) => ({ value: r, label: r })),
              ],
            },
            {
              key: 'cidade',
              label: 'Cidade',
              value: filterCidade,
              onChange: setFilterCidade,
              options: [
                { value: 'Todas', label: 'Todas' },
                ...cidades.map((c) => ({ value: c, label: c })),
              ],
            },
            {
              key: 'mes',
              label: 'Mês',
              value: filterMes,
              onChange: setFilterMes,
              options: [{ value: 'todos', label: 'Todos' }, ...meses],
            },
            {
              key: 'ano',
              label: 'Ano',
              value: filterAno,
              onChange: setFilterAno,
              options: [{ value: 'Todos', label: 'Todos' }, ...anos],
            },
            {
              key: 'status',
              label: 'Status',
              value: filterStatus,
              onChange: setFilterStatus as any,
              options: statusOptions,
            },
            {
              key: 'pendentes',
              label: 'Fechamento',
              value: filterPendentesFechamento,
              onChange: setFilterPendentesFechamento,
              options: [
                { value: 'Todos', label: 'Todos' },
                { value: 'Pendentes', label: 'Pendentes' },
              ],
            },
          ]}
        />

        {/* Table */}
        <Card className="border-0 shadow-card opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-0">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold text-foreground/80 w-12">#</TableHead>
                    <TableHead className="font-semibold text-foreground/80 w-28">Data</TableHead>
                    <TableHead className="font-semibold text-foreground/80 w-[18rem]">Nome</TableHead>
                    <TableHead className="font-semibold text-foreground/80 w-40">CPF</TableHead>
                    <TableHead className="font-semibold text-foreground/80 w-52">Responsável</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Status</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Alertas</TableHead>
                    <TableHead className="font-semibold text-foreground/80 text-right w-40">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                         <div className="flex justify-center items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Carregando atendimentos...
                         </div>
                      </TableCell>
                    </TableRow>
                  ) : atendimentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        Nenhum atendimento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    atendimentos.map((atendimento, index) => (
                      <TableRow
                        key={atendimento.id}
                        className={cn(
                          'hover:bg-muted/20 transition-colors',
                          isAlerta7Dias(atendimento) && 'bg-destructive/5',
                          !isAlerta7Dias(atendimento) && isPendenteFechamento(atendimento) && 'bg-warning/5',
                          isRetorno(atendimento) && 'border-l-4 border-l-info',
                        )}
                      >
                        <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                        <TableCell>{formatDate(atendimento.dataAtendimento)}</TableCell>
                        <TableCell className="font-medium truncate">
                          <span className="truncate">{atendimento.clienteNome}</span>
                          {isRetorno(atendimento) && (
                            <span className="ml-2 text-xs text-muted-foreground">(Retorno)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground truncate">{atendimento.clienteCpf}</TableCell>
                        <TableCell className="truncate">{atendimento.responsavel}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('font-medium', statusBadgeClass(atendimento.status))}>
                            {statusLabel(atendimento.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            {isRetorno(atendimento) && (
                              <Badge variant="outline" className="bg-info/10 text-info border-info/20 gap-1">
                                <RotateCcw className="w-3 h-3" />
                                Retorno
                              </Badge>
                            )}
                            {isPendenteFechamento(atendimento) && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  'gap-1',
                                  isAlerta7Dias(atendimento)
                                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                                    : 'bg-warning/10 text-warning border-warning/20',
                                )}
                              >
                                <AlertTriangle className="w-3 h-3" />
                                Pendente ({diasDesdeAtendimento(atendimento)}d)
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleViewDetails(atendimento)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleFechamento(atendimento)}
                            >
                              <ClipboardList className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-info"
                              onClick={() => handleShowHistory(atendimento.clienteCpf)}
                            >
                              <History className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleEdit(atendimento)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => confirmDelete(atendimento.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

            {/* Load More */}
            {hasMore && (
              <div className="p-4 border-t border-border flex justify-center">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={carregarMais}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    'Carregar mais'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                Detalhes do Atendimento
              </DialogTitle>
            </DialogHeader>
            {viewingAtendimento && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Cliente</Label>
                    <p className="font-medium text-lg">{viewingAtendimento.clienteNome}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">CPF</Label>
                    <p className="font-medium">{viewingAtendimento.clienteCpf}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Telefone</Label>
                    <p className="font-medium">{viewingAtendimento.clienteTelefone}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Data</Label>
                    <p className="font-medium">{formatDate(viewingAtendimento.dataAtendimento)}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Tipo de Procedimento</Label>
                    <p className="font-medium">{viewingAtendimento.tipoProcedimento}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Tipo de Ação</Label>
                    <p className="font-medium">{viewingAtendimento.tipoAcao}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Responsável</Label>
                    <p className="font-medium">{viewingAtendimento.responsavel}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Cidade</Label>
                    <p className="font-medium">{viewingAtendimento.cidade}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Modalidade</Label>
                    <Badge 
                      variant="outline"
                      className={cn(
                        'font-medium mt-1',
                        viewingAtendimento.modalidade === 'Online' 
                          ? 'bg-info/10 text-info border-info/20' 
                          : 'bg-accent/10 text-accent border-accent/20'
                      )}
                    >
                      {viewingAtendimento.modalidade}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge 
                      variant="outline"
                      className={cn(
                        'font-medium mt-1',
                        statusBadgeClass(viewingAtendimento.status)
                      )}
                    >
                      {statusLabel(viewingAtendimento.status)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Observações</Label>
                  <div className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
                    {viewingAtendimento.observacoes || 'Nenhuma observação registrada.'}
                  </div>
                </div>

                {viewingAtendimento.advogadoResponsavel && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Advogado Responsável</Label>
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-2 text-primary font-medium">
                       {viewingAtendimento.advogadoResponsavel}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label className="text-sm font-medium">Ações rápidas</Label>
                    <Button variant="secondary" className="gap-2" onClick={() => handleFechamento(viewingAtendimento)}>
                      <ClipboardList className="w-4 h-4" />
                      Fechamento de Contrato
                    </Button>
                  </div>
                  <div className="mt-3">
                    <Label className="text-sm font-medium mb-2 block">Repassar Atendimento</Label>
                    <div className="flex gap-2">
                      <Select
                        value={advogadoSelecionado[viewingAtendimento.id] || ''}
                        onValueChange={(value) =>
                          setAdvogadoSelecionado((prev) => ({ ...prev, [viewingAtendimento.id]: value }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um advogado" />
                        </SelectTrigger>
                        <SelectContent>
                          {advogados.map((adv) => (
                            <SelectItem key={adv} value={adv}>
                              {adv}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => handleRepassar(viewingAtendimento)}
                        className="gap-2"
                        disabled={!advogadoSelecionado[viewingAtendimento.id]}
                      >
                        <Send className="w-4 h-4" />
                        Repassar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && cancelDelete()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O registro será permanentemente removido.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default Atendimentos;
