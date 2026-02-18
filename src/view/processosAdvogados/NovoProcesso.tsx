import React from 'react';
import { useNovoProcessoViewModel } from '@/viewmodel/processosAdvogados/useNovoProcessoViewModel';
import { statusConfig, areasAtuacao, resultadosAlcancados } from '@/viewmodel/processosAdvogados/shared';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Label } from '@/view/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Switch } from '@/view/components/ui/switch';
import { Card, CardContent } from '@/view/components/ui/card';
import { ArrowLeft, Plus, Trash2, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/view/components/ui/scroll-area';

const NovoProcesso = () => {
  const {
    processo,
    setProcesso,
    loading,
    saving,
    salvar,
    atualizarProcessoEmAndamento,
    adicionarProcesso,
    removerProcesso,
    isEditing,
    handleCancel
  } = useNovoProcessoViewModel();

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title={isEditing ? 'Editar Registro' : 'Novo Registro'} 
        description={isEditing ? 'Atualize as informações do processo.' : 'Cadastre um novo processo.'}
      >
        <Button variant="outline" onClick={handleCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </PageHeader>

      <div className="max-w-[1200px] mx-auto space-y-6">
        <form onSubmit={salvar}>
          <ScrollArea className="h-full">
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Advogado</Label>
                    <Input 
                      value={processo.nomeAdvogado}
                      onChange={(e) => setProcesso(prev => ({ ...prev, nomeAdvogado: e.target.value }))}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Parceria</Label>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={processo.tipoParceria === 'escritorio'}
                          onCheckedChange={(checked) => setProcesso(prev => ({ 
                            ...prev, 
                            tipoParceria: checked ? 'escritorio' : 'advogado' 
                          }))}
                        />
                        <span className="text-sm font-medium">
                          {processo.tipoParceria === 'escritorio' ? 'Escritório' : 'Advogado'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-auto">
                        <Switch 
                          checked={processo.ativo}
                          onCheckedChange={(checked) => setProcesso(prev => ({ ...prev, ativo: checked }))}
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
                    value={processo.areaAtuacao} 
                    onValueChange={(val: any) => setProcesso(prev => ({ ...prev, areaAtuacao: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {areasAtuacao.map(area => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Resultados Alcançados</Label>
                  <Select 
                    value={processo.resultadosAlcancados} 
                    onValueChange={(val: any) => setProcesso(prev => ({ ...prev, resultadosAlcancados: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resultadosAlcancados.map(res => (
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
                    value={processo.honorariosRecebidos}
                    onChange={(e) => setProcesso(prev => ({ ...prev, honorariosRecebidos: Number(e.target.value) }))}
                    prefix="R$ "
                  />
                </div>
                <div className="space-y-2">
                  <Label>Honorários Repassados</Label>
                  <Input 
                    type="number"
                    value={processo.honorariosRepassados}
                    onChange={(e) => setProcesso(prev => ({ ...prev, honorariosRepassados: Number(e.target.value) }))}
                    prefix="R$ "
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Processos em Andamento</h3>
                  <Button type="button" variant="outline" size="sm" onClick={adicionarProcesso}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Processo
                  </Button>
                </div>

                {(!processo.processosEmAndamento || processo.processosEmAndamento.length === 0) && (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    Nenhum processo cadastrado
                  </div>
                )}

                <div className="space-y-4">
                  {processo.processosEmAndamento?.map((proc, idx) => (
                    <Card key={idx} className="bg-muted/10">
                      <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-3 space-y-2">
                              <Label>Nº Processo</Label>
                              <Input 
                                value={proc.numeroProcesso}
                                onChange={(e) => atualizarProcessoEmAndamento(idx, 'numeroProcesso', e.target.value)}
                                placeholder="0000000-00.0000.0.00.0000"
                              />
                            </div>
                            <div className="md:col-span-3 space-y-2">
                              <Label>Link do Processo</Label>
                              <div className="flex gap-2">
                                <Input 
                                  value={proc.linkProcesso}
                                  onChange={(e) => atualizarProcessoEmAndamento(idx, 'linkProcesso', e.target.value)}
                                  placeholder="https://..."
                                />
                                {proc.linkProcesso && (
                                  <Button size="icon" variant="ghost" type="button" onClick={() => window.open(proc.linkProcesso, '_blank')}>
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="md:col-span-3 space-y-2">
                              <Label>Cliente</Label>
                              <Input 
                                value={proc.cliente}
                                onChange={(e) => atualizarProcessoEmAndamento(idx, 'cliente', e.target.value)}
                                placeholder="Nome do cliente"
                              />
                            </div>
                            <div className="md:col-span-3 space-y-2">
                              <Label>Status</Label>
                              <Select 
                                value={proc.statusProcesso}
                                onValueChange={(val: any) => atualizarProcessoEmAndamento(idx, 'statusProcesso', val)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusConfig).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                      <div className="flex items-center gap-2">
                                        <config.icon className={`w-4 h-4 ${config.color}`} />
                                        <span>{config.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => removerProcesso(idx)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="flex justify-end gap-2 mt-6">
             <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
             <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar Registro'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoProcesso;
