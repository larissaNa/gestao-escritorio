import React from 'react';
import { useNovoProcessoViewModel } from '@/viewmodel/processosAdvogados/useNovoProcessoViewModel';
import { statusConfig, areasAtuacao } from '@/viewmodel/processosAdvogados/shared';
import type { AreaAtuacao, StatusProcessoAdvogado } from '@/model/entities';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Label } from '@/view/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/view/components/ui/scroll-area';
import { Card, CardContent } from '@/view/components/ui/card';

const NovoProcesso = () => {
  const {
    processo,
    setProcesso,
    loading,
    saving,
    salvar,
    isEditing,
    handleCancel
  } = useNovoProcessoViewModel();

  if (loading) return <div>Carregando...</div>;

  const showDataFinalizacao = processo.status === 'procedente' || processo.status === 'improcedente' || processo.status === 'parcialmente_procedente';

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

      <div className="max-w-[1200px] mx-auto">
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <form onSubmit={salvar}>
              <ScrollArea className="h-full">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Advogado</Label>
                        <Input 
                          value={processo.nomeAdvogado}
                          readOnly
                          className="bg-muted"
                          placeholder="Nome completo"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Cliente</Label>
                        <Input 
                          value={processo.cliente}
                          onChange={(e) => setProcesso(prev => ({ ...prev, cliente: e.target.value }))}
                          placeholder="Nome do cliente"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Processo / CPF</Label>
                        <Input 
                          value={processo.numeroProcesso}
                          onChange={(e) => setProcesso(prev => ({ ...prev, numeroProcesso: e.target.value }))}
                          placeholder="Nº Processo ou CPF"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tipo de Parceria</Label>
                        <Select 
                            value={processo.tipoParceria} 
                            onValueChange={(val: 'escritorio' | 'advogado') => setProcesso(prev => ({ ...prev, tipoParceria: val }))}
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Área de Atuação</Label>
                      <Select 
                        value={processo.areaAtuacao} 
                        onValueChange={(val: AreaAtuacao) => setProcesso(prev => ({ ...prev, areaAtuacao: val }))}
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
                      <Label>Status</Label>
                      <Select 
                        value={processo.status} 
                        onValueChange={(val: StatusProcessoAdvogado) => setProcesso(prev => ({ ...prev, status: val }))}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Forma de Pagamento</Label>
                      <Input 
                        value={processo.formaPagamento}
                        onChange={(e) => setProcesso(prev => ({ ...prev, formaPagamento: e.target.value }))}
                        placeholder="Ex: À vista, Êxito, Parcelado"
                      />
                    </div>
                    <div className="space-y-2">
                       <Label>Data de Entrada</Label>
                       <Input 
                        type="date"
                        value={processo.dataEntrada ? new Date(processo.dataEntrada).toISOString().split('T')[0] : ''}
                        onChange={(e) => setProcesso(prev => ({ ...prev, dataEntrada: e.target.value ? new Date(e.target.value) : undefined }))}
                       />
                    </div>
                  </div>

                  {showDataFinalizacao && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <Label>Data de Finalização</Label>
                         <Input 
                          type="date"
                          value={processo.dataFinalizacao ? new Date(processo.dataFinalizacao).toISOString().split('T')[0] : ''}
                          onChange={(e) => setProcesso(prev => ({ ...prev, dataFinalizacao: e.target.value ? new Date(e.target.value) : undefined }))}
                         />
                      </div>
                    </div>
                  )}

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
                </div>
              </ScrollArea>
              
              <div className="flex justify-end gap-2 mt-6">
                 <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
                 <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar Registro'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovoProcesso;
