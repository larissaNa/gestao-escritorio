import { Briefcase, ArrowLeft, Loader2, Save } from 'lucide-react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Label } from '@/view/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/view/components/ui/card';
import { Textarea } from '@/view/components/ui/textarea';
import { Switch } from '@/view/components/ui/switch';
import { useNovoServico } from '@/viewmodel/servicos/useNovoServicoViewModel';

const NovoServico = () => {
  const {
    formData,
    setFormData,
    loading,
    error,
    isEditing,
    areas,
    advogados,
    handleSubmit,
    handleCancel
  } = useNovoServico();

  return (
    <div className="space-y-6">
      <PageHeader 
        title={isEditing ? 'Editar Serviço' : 'Novo Serviço'} 
        description={isEditing ? 'Atualize as informações do serviço abaixo.' : 'Preencha os dados para cadastrar um novo serviço.'}
      >
        <Button variant="outline" onClick={handleCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </PageHeader>

      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Dados do Serviço</CardTitle>
            <CardDescription>Informações básicas e honorários</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Área *</Label>
                  <Select 
                    value={formData.area} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, area: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="advogado">Advogado Responsável *</Label>
                  <Select 
                    value={formData.advogadoResponsavel} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, advogadoResponsavel: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o advogado" />
                    </SelectTrigger>
                    <SelectContent>
                      {advogados.map((advogado) => (
                        <SelectItem key={advogado} value={advogado}>{advogado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoAcao">Tipo de Ação / Serviço *</Label>
                <Input 
                  id="tipoAcao"
                  value={formData.tipoAcao}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipoAcao: e.target.value }))}
                  placeholder="Ex: Ação de Divórcio Consensual"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="honorarios">Honorários Sugeridos *</Label>
                <Input 
                  id="honorarios"
                  value={formData.honorarios}
                  onChange={(e) => setFormData(prev => ({ ...prev, honorarios: e.target.value }))}
                  placeholder="Ex: R$ 5.000,00 ou 20% do êxito"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkProcuracao">Link da Procuração</Label>
                  <Input 
                    id="linkProcuracao"
                    value={formData.linkProcuração}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkProcuração: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkChecklist">Link do Checklist</Label>
                  <Input 
                    id="linkChecklist"
                    value={formData.linkChecklist}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkChecklist: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea 
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="ativo" 
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                />
                <Label htmlFor="ativo">Serviço Ativo</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovoServico;
