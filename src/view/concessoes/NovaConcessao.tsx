import React from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Label } from '@/view/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { useNovaConcessao } from '@/viewmodel/concessoes/useNovaConcessaoViewModel';
import { AreaAtuacao } from '@/model/entities';
import { useConfigListOptions } from '@/viewmodel/configLists/useConfigListOptions';

const NovaConcessao = () => {
  const { options: areasOptions } = useConfigListOptions('area', { activeOnly: true });
  const {
    formData,
    setFormData,
    loading,
    isEditing,
    responsaveis,
    handleSubmit,
    handleCancel
  } = useNovaConcessao();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader 
        title={isEditing ? "Editar Concessão" : "Nova Concessão"} 
        description={isEditing ? "Edite os dados da concessão" : "Cadastre uma nova concessão ou procedente"}
      >
        <Button variant="outline" onClick={handleCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Processo/Concessão</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Aposentadoria por idade"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo/Área de Atuação</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as AreaAtuacao }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {areasOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  placeholder="Nome do cliente"
                  value={formData.cliente}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Select
                  value={formData.responsavelUID}
                  onValueChange={(value) => {
                    const resp = responsaveis.find(r => r.id === value);
                    setFormData(prev => ({ 
                      ...prev, 
                      responsavelUID: value,
                      responsavelNome: resp?.nome || ''
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {responsaveis.map((resp) => (
                      <SelectItem key={resp.id} value={resp.id}>
                        {resp.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data da Concessão</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NovaConcessao;
