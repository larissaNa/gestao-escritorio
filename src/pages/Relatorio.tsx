import React, { useEffect } from 'react';
import { Plus, Edit2, Trash2, Filter, X, FileText, Loader2, AlertCircle,TrendingUp,
} from 'lucide-react';
import { useRelatorioPage, demandas, tiposAcao, setores } from '@/hooks/useRelatorioPage';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui/table";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter,} from "@/components/ui/dialog";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";

const Relatorio: React.FC = () => {
  const {
    relatorios,
    loading,
    saving,
    error,
    filtros,
    showModal,
    setShowModal,
    editingRelatorio,
    formData,
    setFormData,
    handleSave,
    handleEdit,
    handleDelete,
    handleCloseModal,
    handleDemandaChange,
    handleFilterChange,
    limparFiltros,
    getFilterValue,
    formatarData,
    getMesNome,
    resumoPontos,
    responsaveis,
    opcoesTipoAcao,
    opcoesSetores,
    meses,
    user
  } = useRelatorioPage();

  if (loading && relatorios.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Relatórios
          </h2>
          <p className="text-muted-foreground">
            Gerencie suas atividades e acompanhe sua produtividade.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Relatório
        </Button>
      </div>

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
                    <SelectItem key={resp.uid} value={resp.uid}>
                      {resp.nome}
                    </SelectItem>
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
                  {opcoesTipoAcao.map((tipo) => (
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
                  {opcoesSetores.map((setor) => (
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

      {/* Resumo Admin */}
      {user?.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumo de Pontos por Responsável
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-right">Total de Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumoPontos.map((item) => (
                  <TableRow key={item.nome}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{item.pontos}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Lista de Relatórios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Relatórios</CardTitle>
              <CardDescription>
                {relatorios.length} registros encontrados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Demanda</TableHead>
                  {user?.role === "admin" && <TableHead>Pontos</TableHead>}
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo de Ação</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={user?.role === "admin" ? 9 : 8} className="text-center h-24 text-muted-foreground">
                      Nenhum relatório encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  relatorios.map((relatorio) => (
                    <TableRow key={relatorio.id}>
                      <TableCell className="whitespace-nowrap">{formatarData(relatorio.data)}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={relatorio.demanda}>
                        {relatorio.demanda}
                      </TableCell>
                      {user?.role === "admin" && (
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {relatorio.pontos}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell>{relatorio.protocolo || '-'}</TableCell>
                      <TableCell>{relatorio.cliente}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {relatorio.tipo_acao}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {relatorio.responsavelNome || relatorio.responsavel}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{relatorio.setor}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(relatorio)}
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(relatorio.id!)}
                            title="Excluir"
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
        </CardContent>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={showModal} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingRelatorio ? 'Editar Relatório' : 'Novo Relatório'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="demanda">Demanda *</Label>
                <Select 
                  value={formData.demanda} 
                  onValueChange={handleDemandaChange}
                >
                  <SelectTrigger id="demanda">
                    <SelectValue placeholder="Selecione a demanda" />
                  </SelectTrigger>
                  <SelectContent>
                    {demandas.map((d) => (
                      <SelectItem key={d.nome} value={d.nome}>
                        <span className="flex justify-between w-full gap-2">
                          <span>{d.nome}</span>
                          <span className="text-muted-foreground text-xs">({d.pontos} pts)</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="protocolo">Nº de Protocolo/Processo</Label>
                <Input
                  id="protocolo"
                  value={formData.protocolo}
                  onChange={(e) => setFormData({ ...formData, protocolo: e.target.value })}
                  placeholder="Digite o número"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_acao">Tipo de Ação *</Label>
                <Select 
                  value={formData.tipo_acao} 
                  onValueChange={(val) => setFormData({ ...formData, tipo_acao: val })}
                >
                  <SelectTrigger id="tipo_acao">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposAcao.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="setor">Setor *</Label>
                <Select 
                  value={formData.setor} 
                  onValueChange={(val) => setFormData({ ...formData, setor: val })}
                >
                  <SelectTrigger id="setor">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map((setor) => (
                      <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={() => handleSave()} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRelatorio ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Relatorio;
