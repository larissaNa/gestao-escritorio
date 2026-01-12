import React from 'react';
import { useBeneficiosPage } from '@/hooks/useBeneficiosPage';
import { BeneficioItem } from '@/types';
import { Award, Plus, Edit2, Trash2, Loader2,} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from '@/components/ui/select';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from '@/components/ui/table';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter,} from '@/components/ui/dialog';

const Beneficios = () => {
  const {
    beneficios,
    loading,
    filtros,
    aplicarFiltros,
    limparFiltros,
    carregarMais,
    hasMore,
    loadingMore,
    showModal,
    setShowModal,
    editingBeneficio,
    responsaveis,
    formData,
    setFormData,
    opcoesTipos,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    formatarData
  } = useBeneficiosPage();

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Benefícios</h1>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Benefício
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
               <div className="flex-1 min-w-[200px]">
                <Label className="mb-2 block text-sm font-medium">Mês/Ano</Label>
                <Input 
                  type="month" 
                  value={filtros.mesAno}
                  onChange={(e) => aplicarFiltros({ mesAno: e.target.value })}
                  className="bg-background"
                />
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-2 block text-sm font-medium">Tipo</Label>
                <Select 
                  value={filtros.tipo} 
                  onValueChange={(value) => aplicarFiltros({ tipo: value === 'todos' ? '' : value })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {opcoesTipos.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={limparFiltros} className="whitespace-nowrap">
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold text-foreground/80 w-[250px]">Nome</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Tipo</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Subtipo</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Cliente</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Responsável</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Data</TableHead>
                    <TableHead className="font-semibold text-foreground/80 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && beneficios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          Carregando benefícios...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : beneficios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        Nenhum benefício encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    beneficios.map((beneficio) => (
                      <TableRow key={beneficio.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="font-medium">{beneficio.nome}</TableCell>
                        <TableCell>
                          <Badge variant={beneficio.tipo === 'Judicial' ? 'default' : 'secondary'} className="font-normal">
                            {beneficio.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{beneficio.subtipo || '-'}</TableCell>
                        <TableCell>{beneficio.cliente}</TableCell>
                        <TableCell>{beneficio.responsavelNome}</TableCell>
                        <TableCell>{formatarData(beneficio.data)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenModal(beneficio)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(beneficio.id!)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {hasMore && (
              <div className="p-4 text-center border-t">
                <Button 
                  variant="secondary" 
                  onClick={carregarMais} 
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
      </div>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingBeneficio ? 'Editar Benefício' : 'Novo Benefício'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Benefício *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Digite o nome"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value as BeneficioItem['tipo'] })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Judicial">Judicial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtipo">Subtipo</Label>
                <Input
                  id="subtipo"
                  value={formData.subtipo}
                  onChange={(e) => setFormData({ ...formData, subtipo: e.target.value })}
                  placeholder="Ex: Revisão"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Select
                value={formData.responsavelUID}
                onValueChange={(value) => setFormData({ ...formData, responsavelUID: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveis.map((resp) => (
                    <SelectItem key={resp.id} value={resp.id}>{resp.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Input
                id="cliente"
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                placeholder="Nome do cliente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingBeneficio ? 'Salvar Alterações' : 'Criar Benefício'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Beneficios;
