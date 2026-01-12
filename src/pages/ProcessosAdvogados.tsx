import { Gavel, Plus, Edit2, Trash2, ExternalLink, PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatCard } from '@/components/dashboard/StatCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useProcessosAdvogados, statusConfig, areasAtuacao, resultadosAlcancados } from '@/hooks/useProcessosAdvogados';
import { StatusProcessoAdvogado, AreaAtuacao, ResultadoAlcancado } from '@/types';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProcessosAdvogados = () => {
  const {
    processos,
    loading,
    saving,
    showModal,
    setShowModal,
    selected,
    setSelected,
    searchTerm,
    setSearchTerm,
    filterArea,
    setFilterArea,
    abrirModalNovo,
    abrirEdicao,
    salvar,
    atualizarProcessoEmAndamento,
    adicionarProcesso,
    removerProcesso,
    graficoExito,
    user,
    isAdmin,
    statusOptions
  } = useProcessosAdvogados();

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
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Gavel className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Advogados e Processos</h1>
          </div>
          <Button onClick={abrirModalNovo} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Registro
          </Button>
        </div>

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
              placeholder="Buscar advogado..." 
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
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Advogado</TableHead>
                  <TableHead>Parceria</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Resultados</TableHead>
                  <TableHead>Honorários</TableHead>
                  <TableHead>Atualização</TableHead>
                  <TableHead>Status Recente</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processos.map((proc) => {
                  const primeiroStatus = proc.processosEmAndamento?.[0]?.statusProcesso;
                  const statusCfg = primeiroStatus ? statusConfig[primeiroStatus] : null;
                  
                  return (
                    <tr key={proc.id} className="hover:bg-muted/20 transition-colors border-b last:border-0">
                      <TableCell className="font-medium">{proc.nomeAdvogado}</TableCell>
                      <TableCell>
                        <Badge variant={proc.tipoParceria === 'escritorio' ? 'default' : 'secondary'}>
                          {proc.tipoParceria === 'escritorio' ? 'Escritório' : 'Advogado'}
                        </Badge>
                      </TableCell>
                      <TableCell>{proc.areaAtuacao}</TableCell>
                      <TableCell>{proc.resultadosAlcancados}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div className="text-green-600">Recebidos: R$ {proc.honorariosRecebidos}</div>
                          <div className="text-muted-foreground">Repassados: R$ {proc.honorariosRepassados}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {proc.dataUltimaAtualizacao?.toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {statusCfg ? (
                           <Badge variant="outline" className={cn("gap-1", statusCfg.color)}>
                              <statusCfg.icon className="w-3 h-3" />
                              {statusCfg.label}
                           </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sem status</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => abrirEdicao(proc)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </tr>
                  );
                })}
                {processos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{selected.id ? 'Editar' : 'Novo'} Registro</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label>Nome do Advogado</Label>
                      <Input 
                        value={selected.nomeAdvogado}
                        onChange={(e) => setSelected(prev => ({ ...prev, nomeAdvogado: e.target.value }))}
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Parceria</Label>
                        <Select 
                          value={selected.tipoParceria} 
                          onValueChange={(val: 'escritorio' | 'advogado') => setSelected(prev => ({ ...prev, tipoParceria: val }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="escritorio">Escritório</SelectItem>
                            <SelectItem value="advogado">Advogado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 flex flex-col justify-end pb-2">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={selected.ativo}
                            onCheckedChange={(checked) => setSelected(prev => ({ ...prev, ativo: checked }))}
                          />
                          <Label>Ativo</Label>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Área de Atuação</Label>
                    <Select 
                      value={selected.areaAtuacao} 
                      onValueChange={(val: AreaAtuacao) => setSelected(prev => ({ ...prev, areaAtuacao: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {areasAtuacao.map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Resultados Alcançados</Label>
                    <Select 
                      value={selected.resultadosAlcancados} 
                      onValueChange={(val: ResultadoAlcancado) => setSelected(prev => ({ ...prev, resultadosAlcancados: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resultadosAlcancados.map((res) => (
                          <SelectItem key={res} value={res}>{res}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label>Honorários Recebidos</Label>
                      <Input 
                        type="number"
                        value={selected.honorariosRecebidos}
                        onChange={(e) => setSelected(prev => ({ ...prev, honorariosRecebidos: Number(e.target.value) }))}
                      />
                   </div>
                   <div className="space-y-2">
                      <Label>Honorários Repassados</Label>
                      <Input 
                        type="number"
                        value={selected.honorariosRepassados}
                        onChange={(e) => setSelected(prev => ({ ...prev, honorariosRepassados: Number(e.target.value) }))}
                      />
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Processos em Andamento</h3>
                    <Button size="sm" variant="outline" onClick={adicionarProcesso}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Processo
                    </Button>
                  </div>
                  
                  {(!selected.processosEmAndamento || selected.processosEmAndamento.length === 0) && (
                    <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded-md">
                      Nenhum processo adicionado.
                    </div>
                  )}

                  <div className="space-y-4">
                    {selected.processosEmAndamento?.map((proc, idx) => (
                      <Card key={idx} className="bg-muted/10">
                        <CardContent className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                             <div className="md:col-span-3 space-y-2">
                                <Label>Nº Processo</Label>
                                <Input 
                                  value={proc.numeroProcesso}
                                  onChange={(e) => atualizarProcessoEmAndamento(idx, 'numeroProcesso', e.target.value)}
                                />
                             </div>
                             <div className="md:col-span-3 space-y-2">
                                <Label>Link</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    value={proc.linkProcesso}
                                    onChange={(e) => atualizarProcessoEmAndamento(idx, 'linkProcesso', e.target.value)}
                                  />
                                  {proc.linkProcesso && (
                                    <Button size="icon" variant="ghost" asChild>
                                      <a href={proc.linkProcesso} target="_blank" rel="noreferrer">
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                             </div>
                             <div className="md:col-span-3 space-y-2">
                                <Label>Cliente</Label>
                                <Input 
                                  value={proc.cliente}
                                  onChange={(e) => atualizarProcessoEmAndamento(idx, 'cliente', e.target.value)}
                                />
                             </div>
                             <div className="md:col-span-3 space-y-2 flex items-end justify-between gap-2">
                                <div className="flex-1 space-y-2">
                                   <Label>Status</Label>
                                   <Select 
                                      value={proc.statusProcesso} 
                                      onValueChange={(val) => atualizarProcessoEmAndamento(idx, 'statusProcesso', val as StatusProcessoAdvogado)}
                                   >
                                     <SelectTrigger>
                                        <SelectValue />
                                     </SelectTrigger>
                                     <SelectContent>
                                        {statusOptions.map((s) => (
                                           <SelectItem key={s} value={s}>
                                              {statusConfig[s].label}
                                           </SelectItem>
                                        ))}
                                     </SelectContent>
                                   </Select>
                                </div>
                                <Button size="icon" variant="destructive" onClick={() => removerProcesso(idx)}>
                                   <Trash2 className="w-4 h-4" />
                                </Button>
                             </div>
                             <div className="md:col-span-3 space-y-2">
                                <Label>Data Ajuizamento</Label>
                                <Input 
                                  type="date"
                                  value={proc.dataAjuizamento ? new Date(proc.dataAjuizamento).toISOString().split('T')[0] : ''}
                                  onChange={(e) => atualizarProcessoEmAndamento(idx, 'dataAjuizamento', e.target.value ? new Date(e.target.value) : undefined)}
                                />
                             </div>
                             <div className="md:col-span-3 space-y-2">
                                <Label>Data Decisão</Label>
                                <Input 
                                  type="date"
                                  value={proc.dataDecisao ? new Date(proc.dataDecisao).toISOString().split('T')[0] : ''}
                                  onChange={(e) => atualizarProcessoEmAndamento(idx, 'dataDecisao', e.target.value ? new Date(e.target.value) : undefined)}
                                />
                             </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
            
            <DialogFooter className="pt-4 border-t mt-auto">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={salvar} disabled={saving}>
                {saving ? (
                   <>Salvando...</>
                ) : (
                   <>Salvar Alterações</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProcessosAdvogados;
