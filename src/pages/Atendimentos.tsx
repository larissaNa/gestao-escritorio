import {ClipboardList,Plus,Edit2,Trash2,History,Send,Loader2,Eye} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from '@/components/ui/select';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from '@/components/ui/table';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter,} from '@/components/ui/dialog';
import { DataFilters } from '@/components/ui/data-filters';
import { cn } from '@/lib/utils';
import { useAtendimentos } from '@/hooks/useAtendimentos';

const Atendimentos = () => {
  const {
    atendimentos,
    clienteHistory,
    cpfSuggestions,
    nomeSuggestions,
    tiposAcao,
    responsaveis,
    cidades,
    advogados,
    meses,
    loading,
    loadingMore,
    hasMore,
    searchingClient,
    showModal,
    setShowModal,
    showHistoryModal,
    setShowHistoryModal,
    showCpfSuggestions,
    showNomeSuggestions,
    advogadoSelecionado,
    setAdvogadoSelecionado,
    editingAtendimento,
    formData,
    setFormData,
    searchTerm,
    setSearchTerm,
    filterResponsavel,
    setFilterResponsavel,
    filterCidade,
    setFilterCidade,
    filterMes,
    setFilterMes,
    carregarMais,
    handleSubmit,
    handleRepassar,
    handleDelete,
    handleEdit,
    handleNomeChange,
    handleCpfChange,
    selectSuggestion,
    handleShowHistory,
    showDetailsModal,
    setShowDetailsModal,
    viewingAtendimento,
    handleViewDetails,
    resetForm,
  } = useAtendimentos();

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Atendimentos</h1>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Atendimento
          </Button>
        </div>

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
                              onClick={() => handleDelete(atendimento.id)}
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

        {/* New/Edit Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                {editingAtendimento ? 'Editar Atendimento' : 'Novo Atendimento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Nome e CPF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="nome">Nome *</Label>
                  <div className="relative">
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={handleNomeChange}
                      placeholder="Nome completo"
                      required
                      autoComplete="off"
                    />
                    {searchingClient && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  {showNomeSuggestions && nomeSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-popover text-popover-foreground border rounded-md shadow-md mt-1 max-h-40 overflow-y-auto">
                      {nomeSuggestions.map(cliente => (
                        <div
                          key={cliente.id}
                          className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => selectSuggestion(cliente)}
                        >
                          {cliente.nome} ({cliente.cpf})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="cpf">CPF *</Label>
                  <div className="relative">
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      required
                      autoComplete="off"
                    />
                     {searchingClient && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ao preencher o CPF, se o cliente já existir, os dados serão carregados automaticamente.
                  </p>
                  {showCpfSuggestions && cpfSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-popover text-popover-foreground border rounded-md shadow-md mt-1 max-h-40 overflow-y-auto">
                      {cpfSuggestions.map(cliente => (
                        <div
                          key={cliente.id}
                          className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => selectSuggestion(cliente)}
                        >
                          {cliente.cpf} - {cliente.nome}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Telefone, Procedimento, Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoProcedimento">Tipo de Procedimento</Label>
                  <Input
                    id="tipoProcedimento"
                    value={formData.tipoProcedimento}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tipoProcedimento: e.target.value }))
                    }
                    placeholder="Ex: Consulta Inicial"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataAtendimento">Data do Atendimento *</Label>
                  <Input
                    id="dataAtendimento"
                    type="date"
                    value={formData.dataAtendimento}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dataAtendimento: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Row 3: Tipo Ação e Responsável */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Ação *</Label>
                  <Select
                    value={formData.tipoAcao}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, tipoAcao: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a ação" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposAcao.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Responsável *</Label>
                  <Select
                    value={formData.responsavel}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, responsavel: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {responsaveis.map((resp) => (
                        <SelectItem key={resp} value={resp}>
                          {resp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Cidade, Modalidade, Advogado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cidade *</Label>
                  <Select
                    value={formData.cidade}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, cidade: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cidades.map((cidade) => (
                        <SelectItem key={cidade} value={cidade}>
                          {cidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Modalidade *</Label>
                  <Select
                    value={formData.modalidade}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, modalidade: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Presencial">Presencial</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Repassar para Advogado</Label>
                  <Select
                    value={formData.advogadoResponsavel}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, advogadoResponsavel: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Não repassar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Não repassar</SelectItem>
                      {advogados.map((adv) => (
                        <SelectItem key={adv} value={adv}>
                          {adv}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 5: Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, observacoes: e.target.value }))
                  }
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
                    <TableHead className="font-semibold">Advogado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clienteHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        Nenhum histórico encontrado para este CPF.
                      </TableCell>
                    </TableRow>
                  ) : (
                    clienteHistory.map((atendimento) => (
                      <TableRow key={atendimento.id}>
                        <TableCell>{atendimento.dataAtendimento.toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{atendimento.tipoProcedimento}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'font-medium',
                              atendimento.modalidade === 'Online'
                                ? 'bg-info/10 text-info border-info/20'
                                : 'bg-accent/10 text-accent border-accent/20'
                            )}
                          >
                            {atendimento.modalidade}
                          </Badge>
                        </TableCell>
                        <TableCell>{atendimento.responsavel}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'font-medium',
                              atendimento.status === 'finalizado'
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-warning/10 text-warning border-warning/20'
                            )}
                          >
                            {atendimento.status === 'finalizado' ? 'Finalizado' : 'Em Andamento'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {atendimento.advogadoResponsavel ? (
                            <Badge variant="secondary">{atendimento.advogadoResponsavel}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                Detalhes do Atendimento
              </DialogTitle>
            </DialogHeader>
            {viewingAtendimento && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Data</Label>
                    <p className="font-medium">{viewingAtendimento.dataAtendimento.toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <p className="font-medium">{viewingAtendimento.clienteNome}</p>
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
                    <Label className="text-xs text-muted-foreground">Tipo Procedimento</Label>
                    <p className="font-medium">{viewingAtendimento.tipoProcedimento}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Tipo Ação</Label>
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

                <div className="pt-4 border-t space-y-3">
                  <Label className="text-sm font-semibold">Advogado Responsável</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={advogadoSelecionado[viewingAtendimento.id] || viewingAtendimento.advogadoResponsavel || ''}
                      onValueChange={(value) =>
                        setAdvogadoSelecionado((prev) => ({
                          ...prev,
                          [viewingAtendimento.id]: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-[300px]">
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
                      variant="default"
                      className="gap-2"
                      onClick={() => handleRepassar(viewingAtendimento)}
                    >
                      <Send className="w-4 h-4" />
                      Repassar / Atualizar
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Atendimentos;
