import { ClipboardList, Plus, Edit2, Trash2, History, Eye, Loader2, Send } from 'lucide-react';
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
    clienteHistory,
    responsaveis,
    cidades,
    advogados,
    meses,
    loading,
    loadingMore,
    hasMore,
    showHistoryModal,
    setShowHistoryModal,
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
    carregarMais,
    handleRepassar,
    confirmDelete,
    cancelDelete,
    executeDelete,
    deleteId,
    handleEdit,
    handleNew,
    handleShowHistory,
    handleViewDetails,
  } = useAtendimentos();

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
          ]}
        />

        {/* Table */}
        <Card className="border-0 shadow-card opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold text-foreground/80 w-12">#</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Data</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Nome</TableHead>
                    <TableHead className="font-semibold text-foreground/80">CPF</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Tipo Procedimento</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Tipo Ação</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Responsável</TableHead>
                    <TableHead className="font-semibold text-foreground/80 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-12">
                         <div className="flex justify-center items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Carregando atendimentos...
                         </div>
                      </TableCell>
                    </TableRow>
                  ) : atendimentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-12 text-muted-foreground">
                        Nenhum atendimento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    atendimentos.map((atendimento, index) => (
                      <TableRow key={atendimento.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                        <TableCell>{atendimento.dataAtendimento.toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="font-medium">{atendimento.clienteNome}</TableCell>
                        <TableCell className="text-muted-foreground">{atendimento.clienteCpf}</TableCell>
                        <TableCell>{atendimento.tipoProcedimento}</TableCell>
                        <TableCell>{atendimento.tipoAcao}</TableCell>
                        <TableCell>{atendimento.responsavel}</TableCell>
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
            </div>

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

        {/* History Modal */}
        <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Histórico de Atendimentos
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold">Data</TableHead>
                    <TableHead className="font-semibold">Tipo Procedimento</TableHead>
                    <TableHead className="font-semibold">Modalidade</TableHead>
                    <TableHead className="font-semibold">Responsável</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clienteHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.dataAtendimento.toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{item.tipoProcedimento}</TableCell>
                      <TableCell>{item.modalidade}</TableCell>
                      <TableCell>{item.responsavel}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={cn(
                            item.status === 'finalizado' 
                              ? 'bg-success/10 text-success border-success/20' 
                              : 'bg-warning/10 text-warning border-warning/20'
                          )}
                        >
                          {item.status === 'finalizado' ? 'Finalizado' : 'Em Andamento'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {clienteHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum histórico encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>

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
                    <p className="font-medium">{viewingAtendimento.dataAtendimento.toLocaleDateString('pt-BR')}</p>
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
                        viewingAtendimento.status === 'finalizado' 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-warning/10 text-warning border-warning/20'
                      )}
                    >
                      {viewingAtendimento.status === 'finalizado' ? 'Finalizado' : 'Em Andamento'}
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
                  <Label className="text-sm font-medium mb-2 block">Repassar Atendimento</Label>
                  <div className="flex gap-2">
                    <Select
                      value={advogadoSelecionado[viewingAtendimento.id] || ''}
                      onValueChange={(value) => setAdvogadoSelecionado(prev => ({ ...prev, [viewingAtendimento.id]: value }))}
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
