import React from 'react';
import { Gavel, Plus, PieChart as PieChartIcon, Trash2 } from 'lucide-react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Card, CardContent } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Badge } from '@/view/components/ui/badge';
import { Input } from '@/view/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table';
import { StatCard } from '@/view/components/dashboard/StatCard';
import { ChartCard } from '@/view/components/dashboard/ChartCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useProcessosViewModel } from '@/viewmodel/processosAdvogados/useProcessosViewModel';
import { statusConfig, areasAtuacao } from '@/viewmodel/processosAdvogados/shared';
import { Alert, AlertDescription } from '@/view/components/ui/alert';
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

const Processos = () => {
  const {
    processos,
    loading,
    searchTerm,
    setSearchTerm,
    filterArea,
    setFilterArea,
    handleNew,
    handleEdit,
    graficoExito,
    user,
    isAdmin,
    deleteId,
    confirmDelete,
    cancelDelete,
    executeDelete
  } = useProcessosViewModel();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin && user?.role !== 'advogado') {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>
            Apenas advogados ou administradores podem acessar esta área.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestão de Advogados e Processos" 
        description="Gerencie os processos e advogados do escritório."
      >
        <Button onClick={handleNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Registro
        </Button>
      </PageHeader>

      <div className="max-w-[1600px] mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Registros"
            value={processos.length}
            icon={Gavel}
            variant="primary"
            delay={0}
          />
          <StatCard
            title="% de Êxito"
            value={`${graficoExito.resumo.percentualExito}%`}
            icon={PieChartIcon}
            variant="success"
            delay={100}
          />
           {/* Chart */}
          <ChartCard
            title="Distribuição de Êxito"
            icon={PieChartIcon}
            delay={200}
            className="md:col-span-1"
          >
             <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={graficoExito.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {graficoExito.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)' 
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
           <div className="relative w-full sm:w-72">
            <Input 
              placeholder="Buscar advogado, cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-56">
            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Áreas</SelectItem>
                {areasAtuacao.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Advogado</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Processo/CPF</TableHead>
                  <TableHead>Parceria</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Honorários</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Atualização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processos.map((proc) => {
                  const statusCfg = statusConfig[proc.status];
                  
                  return (
                    <TableRow 
                      key={proc.id} 
                      className="cursor-pointer hover:bg-muted/20"
                      onClick={() => handleEdit(proc.id!)}
                    >
                      <TableCell className="font-medium">{proc.nomeAdvogado}</TableCell>
                      <TableCell>{proc.cliente}</TableCell>
                      <TableCell>{proc.numeroProcesso}</TableCell>
                      <TableCell>
                        <Badge variant={proc.tipoParceria === 'escritorio' ? 'default' : 'secondary'}>
                          {proc.tipoParceria === 'escritorio' ? 'Escritório' : 'Advogado'}
                        </Badge>
                      </TableCell>
                      <TableCell>{proc.areaAtuacao}</TableCell>
                      <TableCell>
                        {statusCfg ? (
                          <div className={`flex items-center gap-1.5 ${statusCfg.color}`}>
                            <statusCfg.icon className="w-4 h-4" />
                            <span className="text-xs font-medium">{statusCfg.label}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div className="text-green-600">Recebidos: R$ {proc.honorariosRecebidos}</div>
                          <div className="text-muted-foreground">Repassados: R$ {proc.honorariosRepassados}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{proc.formaPagamento}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {proc.dataUltimaAtualizacao?.toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button 
                             variant="ghost" 
                             size="sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleEdit(proc.id!);
                             }}
                           >
                             Editar
                           </Button>
                           <Button
                             variant="ghost"
                             size="icon"
                             className="text-destructive hover:text-destructive hover:bg-destructive/10"
                             onClick={(e) => {
                               e.stopPropagation();
                               confirmDelete(proc.id!);
                             }}
                           >
                             <Trash2 className="h-4 w-4" />
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
            <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Processos;
