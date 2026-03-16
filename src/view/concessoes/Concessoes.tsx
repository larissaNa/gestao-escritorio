import React from 'react';
import { Award, Plus, Edit2, Trash2, Loader2, Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Badge } from '@/view/components/ui/badge';
import { Input } from '@/view/components/ui/input';
import { Label } from '@/view/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/view/components/ui/alert';
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
import { PageHeader } from '@/view/components/layout/PageHeader';
import { useConcessoes } from '@/viewmodel/concessoes/useConcessoesViewModel';
import { AreaAtuacao } from '@/model/entities';

const Concessoes = () => {
  const {
    concessoes,
    loading,
    error,
    filtros,
    aplicarFiltros,
    limparFiltros,
    carregarMais,
    hasMore,
    loadingMore,
    obterOpcoesFiltros,
    handleNew,
    handleEdit,
    confirmDelete,
    cancelDelete,
    executeDelete,
    deleteId
  } = useConcessoes();

  const { tipos: opcoesTipos, mesesAno: opcoesMeses, responsaveis: opcoesResponsaveis } = obterOpcoesFiltros;

  const formatarData = (data: Date | string) => {
    const dataObj = data instanceof Date ? data : new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Concessões" 
        description="Gerencie as concessões e procedentes do escritório"
      >
        <div className="flex gap-2">
          <Button onClick={handleNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Concessão
          </Button>
        </div>
      </PageHeader>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card className="mb-6 border-0 shadow-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
              <Label>Mês/Ano</Label>
              <Input 
                type="month" 
                value={filtros.mesAno}
                onChange={(e) => aplicarFiltros({ mesAno: e.target.value })}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={filtros.tipo} 
                onValueChange={(value) => aplicarFiltros({ tipo: value === 'todos' ? '' : (value as AreaAtuacao | '') })}
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

            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select 
                value={filtros.responsavel} 
                onValueChange={(value) => aplicarFiltros({ responsavel: value === 'todos' ? '' : value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Todos os responsáveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {opcoesResponsaveis.map((resp) => (
                    <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  <TableHead className="font-semibold text-foreground/80 w-[50px]">Nº</TableHead>
                  <TableHead className="font-semibold text-foreground/80 w-[250px]">Nome</TableHead>
                  <TableHead className="font-semibold text-foreground/80">Tipo</TableHead>
                  <TableHead className="font-semibold text-foreground/80">Cliente</TableHead>
                  <TableHead className="font-semibold text-foreground/80">Responsável</TableHead>
                  <TableHead className="font-semibold text-foreground/80">Data</TableHead>
                  <TableHead className="font-semibold text-foreground/80 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && concessoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Carregando concessões...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : concessoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Nenhuma concessão encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  concessoes.map((concessao, index) => (
                    <TableRow key={concessao.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{concessao.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {concessao.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{concessao.cliente}</TableCell>
                      <TableCell>{concessao.responsavelNome}</TableCell>
                      <TableCell>{formatarData(concessao.data)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(concessao)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(concessao.id!)}
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

      <AlertDialog open={!!deleteId} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta concessão? Esta ação não pode ser desfeita.
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

export default Concessoes;
