import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Filter,
  X,
  FileDown,
  Loader2,
  AlertCircle,
  Calendar,
  Search,
  BookOpen,
  FileBarChart,
  FileText,
} from 'lucide-react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Label } from '@/view/components/ui/label';
import { Badge } from '@/view/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
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
} from '@/view/components/ui/alert-dialog';
import { useRelatorioDiario } from '@/viewmodel/relatorios/useRelatorioDiarioViewModel';

const RelatorioDiario: React.FC = () => {
  const {
    relatorios,
    totalRelatorios,
    loading,
    error,
    filtros,
    aplicarFiltros,
    limparFiltros,
    obterOpcoesFiltros,
    handleNew,
    handleEdit,
    handleExportPage,
    confirmDelete,
    cancelDelete,
    executeDelete,
    deleteId,
    exportarPdfDireto,
    exportandoPdf,
    isAdmin,
  } = useRelatorioDiario();

  const { responsaveis } = obterOpcoesFiltros;

  const getFilterValue = (val: string) => {
    if (val === '' || val === null || val === undefined) return 'ALL';
    return String(val);
  };

  const formatarData = (data: Date | unknown) => {
    if (data instanceof Date) {
      return data.toLocaleDateString('pt-BR');
    }
    if (typeof data === 'string') {
      const [ano, mes, dia] = data.split('T')[0].split('-');
      if (ano && mes && dia) return `${dia}/${mes}/${ano}`;
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Abas Superiores de Navegação no Módulo de Relatórios */}
      <div className="flex border-b border-border space-x-2 pb-1 overflow-x-auto">
        <Link to="/relatorio">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <FileBarChart className="w-4 h-4" />
            Relatórios de Atividades
          </Button>
        </Link>
        <Link to="/relatorio/diario">
          <Button variant="secondary" className="gap-2 font-medium">
            <BookOpen className="w-4 h-4 text-primary" />
            Relatório Diário (Diário de Bordo)
          </Button>
        </Link>
        <Link to="/relatorio/diario/exportar">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <FileDown className="w-4 h-4" />
            Exportar Diário em PDF
          </Button>
        </Link>
        {isAdmin && (
          <Link to="/relatorio/mensal">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <FileText className="w-4 h-4" />
              Relatórios Mensais (Admin)
            </Button>
          </Link>
        )}
      </div>

      <PageHeader
        title="Relatório Diário"
        description="Diário de bordo para estagiários registrarem e consultarem suas atividades textualmente."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={exportarPdfDireto}
            disabled={loading || exportandoPdf || relatorios.length === 0}
            className="gap-2"
          >
            {exportandoPdf ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </>
            )}
          </Button>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Registro
          </Button>
        </div>
      </PageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Card de Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros do Diário
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={limparFiltros}>
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Responsável */}
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select
                value={getFilterValue(filtros.responsavel)}
                onValueChange={(val) => aplicarFiltros({ responsavel: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os Responsáveis</SelectItem>
                  {responsaveis.map((resp) => (
                    <SelectItem key={resp.uid} value={resp.uid}>
                      {resp.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Inicial */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Data Inicial
              </Label>
              <Input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => aplicarFiltros({ dataInicio: e.target.value })}
              />
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Data Final
              </Label>
              <Input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => aplicarFiltros({ dataFim: e.target.value })}
              />
            </div>

            {/* Busca textual */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Search className="w-3.5 h-3.5" />
                Buscar nas Atividades
              </Label>
              <Input
                placeholder="Palavra-chave..."
                value={filtros.termo}
                onChange={(e) => aplicarFiltros({ termo: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Relatórios Diários */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Registros Encontrados ({relatorios.length}
            {totalRelatorios !== relatorios.length && ` de ${totalRelatorios}`})
          </CardTitle>
          <Button variant="link" size="sm" onClick={handleExportPage} className="text-xs gap-1">
            Opções avançadas de exportação &rarr;
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Data</TableHead>
                <TableHead className="w-[200px]">Responsável</TableHead>
                <TableHead>Descrição das Atividades (Diário de Bordo)</TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      Carregando diário de bordo...
                    </div>
                  </TableCell>
                </TableRow>
              ) : relatorios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                      <span>Nenhum registro diário encontrado com os filtros aplicados.</span>
                      <Button variant="outline" size="sm" onClick={handleNew} className="mt-2 gap-1">
                        <Plus className="h-4 w-4" />
                        Cadastrar Primeiro Registro
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                relatorios.map((relatorio) => (
                  <TableRow key={relatorio.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium align-top whitespace-nowrap">
                      {formatarData(relatorio.data)}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-foreground">
                          {relatorio.responsavelNome}
                        </span>
                        <Badge variant="outline" className="w-fit text-[10px] mt-1">
                          Estagiário
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 max-w-3xl">
                        {relatorio.descricao}
                      </div>
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar registro"
                          onClick={() => handleEdit(relatorio)}
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Excluir registro"
                          onClick={() => relatorio.id && confirmDelete(relatorio.id)}
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
        </CardContent>
      </Card>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro diário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro deste dia será permanentemente removido do diário de bordo.
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

export default RelatorioDiario;
