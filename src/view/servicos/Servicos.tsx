import React from 'react';
import { Plus, Edit, Trash2, Filter, X, Download, Briefcase, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Button } from "@/view/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/view/components/ui/card";
import { Label } from "@/view/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/view/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/view/components/ui/alert";
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
import { Badge } from "@/view/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/view/components/ui/dropdown-menu";
import { DataTable } from '@/view/components/dashboard/DataTable';
import { useServicos } from '@/viewmodel/servicos/useServicosViewModel';
import { ServicoItem } from '@/model/entities';
import { cn } from '@/lib/utils';

const Servicos: React.FC = () => {
  const {
    servicos,
    loading,
    error,
    filtros,
    aplicarFiltros,
    limparFiltros,
    handleNew,
    handleEdit,
    confirmDelete,
    cancelDelete,
    executeDelete,
    deleteId,
    handleToggleAtivo,
    obterOpcoesFiltros
  } = useServicos();

  const { areas: opcoesAreas, advogados: opcoesAdvogados } = obterOpcoesFiltros;

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
              <DropdownMenuItem onClick={() => handleEdit(item)}>
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
                onClick={() => item.id && confirmDelete(item.id)}
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

  if (loading && servicos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tabela de Honorários" 
        description="Gerencie os serviços e honorários do escritório"
      >
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </PageHeader>

      <div className="space-y-8">
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

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && cancelDelete()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O serviço será permanentemente removido.
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
    </div>
  );
};

export default Servicos;
