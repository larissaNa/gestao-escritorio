import { Plus, Edit2, Trash2, Filter, X, FileText, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
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
} from "@/view/components/ui/alert-dialog";
import { useRelatorios } from '@/viewmodel/relatorios/useRelatoriosViewModel';

const Relatorios = () => {
  const {
    relatorios,
    loading,
    error,
    filtros,
    handleNew,
    handleEdit,
    confirmDelete,
    cancelDelete,
    executeDelete,
    deleteId,
    aplicarFiltros,
    limparFiltros,
    obterOpcoesFiltros,
    resumoPontos,
    user
  } = useRelatorios();

  const { responsaveis, tiposAcao, setores, meses } = obterOpcoesFiltros;

  const getMesNome = (mes: number) => {
    const mesesNomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return mesesNomes[mes - 1] || '';
  };

  const getFilterValue = (val: any) => {
    if (val === "" || val === null || val === undefined) return "ALL";
    return String(val);
  };

  const handleFilterChange = (field: string, val: string) => {
    aplicarFiltros({ [field]: val === "ALL" ? "" : val });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Relatórios" 
        description="Gerencie suas atividades e acompanhe sua produtividade."
      >
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Relatório
        </Button>
      </PageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={limparFiltros}>
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select 
                value={getFilterValue(filtros.responsavel)} 
                onValueChange={(val) => handleFilterChange('responsavel', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {responsaveis.map((resp) => (
                    <SelectItem key={resp.uid} value={resp.uid}>{resp.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Ação</Label>
              <Select 
                value={getFilterValue(filtros.tipoAcao)} 
                onValueChange={(val) => handleFilterChange('tipoAcao', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {tiposAcao.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Setor</Label>
              <Select 
                value={getFilterValue(filtros.setor)} 
                onValueChange={(val) => handleFilterChange('setor', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {setores.map((setor) => (
                    <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mês</Label>
              <Select 
                value={getFilterValue(filtros.mes)} 
                onValueChange={(val) => handleFilterChange('mes', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {meses.map((mes) => (
                    <SelectItem key={mes} value={String(mes)}>{getMesNome(mes)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Pontos (Admin) */}
      {user?.role === 'admin' && resumoPontos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pontuação por Colaborador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {resumoPontos.map((item) => (
                <div key={item.nome} className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                  <span className="font-medium">{item.nome}:</span>
                  <Badge variant="secondary">{item.pontos} pts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Demanda</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Carregando relatórios...
                    </div>
                  </TableCell>
                </TableRow>
              ) : relatorios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum relatório encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                relatorios.map((relatorio) => (
                  <TableRow key={relatorio.id}>
                    <TableCell>{new Date(relatorio.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{relatorio.responsavelNome}</TableCell>
                    <TableCell className="font-medium">{relatorio.cliente}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{relatorio.demanda}</span>
                        {relatorio.protocolo && (
                          <span className="text-xs text-muted-foreground">Prot: {relatorio.protocolo}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{relatorio.setor}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {relatorio.pontos}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {(user?.role === 'admin' || user?.uid === relatorio.responsavel) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(relatorio)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => confirmDelete(relatorio.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O relatório será permanentemente removido.
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

export default Relatorios;
