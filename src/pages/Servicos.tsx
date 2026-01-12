import React from 'react';
import { Plus, Edit, Trash2, Filter, X, Download, Briefcase,Search,MoreVertical,CheckCircle2,XCircle} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useServicosPage } from '@/hooks/useServicosPage';
import { DataTable } from '@/components/dashboard/DataTable';
import type { ServicoItem } from '@/types';
import { cn } from '@/lib/utils';
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";

const Servicos: React.FC = () => {
  const {
    servicos,
    loading,
    error,
    filtros,
    aplicarFiltros,
    limparFiltros,
    showModal,
    setShowModal,
    editingServico,
    formData,
    setFormData,
    areas,
    advogados,
    opcoesAreas,
    opcoesAdvogados,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    handleToggleAtivo
  } = useServicosPage();

  if (loading && servicos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const columns = [
    {
      key: 'area',
      header: 'Área',
      render: (item: ServicoItem) => (
        <Badge variant="secondary" className="font-medium">
          {item.area}
        </Badge>
      )
    },
    {
      key: 'tipoAcao',
      header: 'Tipo de Ação / Serviço',
      render: (item: ServicoItem) => <span className="font-medium">{item.tipoAcao}</span>
    },
    {
      key: 'honorarios',
      header: 'Honorários Sugeridos',
      render: (item: ServicoItem) => <span className="text-muted-foreground">{item.honorarios}</span>
    },
    {
      key: 'advogadoResponsavel',
      header: 'Advogado Responsável',
      render: (item: ServicoItem) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {item.advogadoResponsavel.charAt(0)}
          </div>
          <span className="text-sm">{item.advogadoResponsavel}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ServicoItem) => (
        <Badge variant={item.ativo ? "default" : "secondary"} className={cn(
          item.ativo ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-500/20" : "bg-gray-100 text-gray-500"
        )}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (item: ServicoItem) => (
        <div className="flex items-center gap-2">
          {item.linkProcuração && (
             <Button
             variant="ghost"
             size="icon"
             className="h-8 w-8 text-muted-foreground hover:text-primary"
             onClick={() => window.open(item.linkProcuração, '_blank')}
             title="Baixar Procuração"
           >
             <Download className="h-4 w-4" />
           </Button>
          )}
           {item.linkChecklist && (
             <Button
             variant="ghost"
             size="icon"
             className="h-8 w-8 text-muted-foreground hover:text-primary"
             onClick={() => window.open(item.linkChecklist, '_blank')}
             title="Baixar Checklist"
           >
             <CheckCircle2 className="h-4 w-4" />
           </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenModal(item)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleAtivo(item)}>
                {item.ativo ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4 text-orange-500" />
                    Desativar
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    Ativar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => item.id && handleDelete(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tabela de Honorários</h1>
              <p className="text-sm text-muted-foreground">Gerencie os serviços e honorários do escritório</p>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={limparFiltros}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Área</Label>
                <Select 
                  value={filtros.area} 
                  onValueChange={(value) => aplicarFiltros({ area: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as áreas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as áreas</SelectItem>
                    {opcoesAreas.map((area) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Advogado Responsável</Label>
                <Select 
                  value={filtros.advogado} 
                  onValueChange={(value) => aplicarFiltros({ advogado: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os advogados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os advogados</SelectItem>
                    {opcoesAdvogados.map((advogado) => (
                      <SelectItem key={advogado} value={advogado}>{advogado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <DataTable
          title="Serviços Cadastrados"
          icon={Briefcase}
          data={servicos}
          columns={columns}
          count={servicos.length}
          emptyMessage="Nenhum serviço encontrado com os filtros selecionados."
        />

        {/* Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingServico ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
              <DialogDescription>
                {editingServico ? 'Atualize as informações do serviço abaixo.' : 'Preencha os dados para cadastrar um novo serviço.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Área *</Label>
                  <Select 
                    value={formData.area} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, area: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="advogado">Advogado Responsável *</Label>
                  <Select 
                    value={formData.advogadoResponsavel} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, advogadoResponsavel: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o advogado" />
                    </SelectTrigger>
                    <SelectContent>
                      {advogados.map((advogado) => (
                        <SelectItem key={advogado} value={advogado}>{advogado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoAcao">Tipo de Ação / Serviço *</Label>
                <Input
                  id="tipoAcao"
                  value={formData.tipoAcao}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipoAcao: e.target.value }))}
                  placeholder="Ex: Ação de Cobrança"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="honorarios">Honorários Sugeridos *</Label>
                  <Input
                    id="honorarios"
                    value={formData.honorarios}
                    onChange={(e) => setFormData(prev => ({ ...prev, honorarios: e.target.value }))}
                    placeholder="Ex: R$ 1.518,00 + 30%"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                  />
                  <Label htmlFor="ativo">Serviço ativo</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações sobre o serviço"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkProcuracao">Link da Procuração</Label>
                  <Input
                    id="linkProcuracao"
                    value={formData.linkProcuração}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkProcuração: e.target.value }))}
                    placeholder="https://..."
                    type="url"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkChecklist">Link do Checklist</Label>
                  <Input
                    id="linkChecklist"
                    value={formData.linkChecklist}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkChecklist: e.target.value }))}
                    placeholder="https://..."
                    type="url"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : (editingServico ? 'Atualizar' : 'Cadastrar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Servicos;
