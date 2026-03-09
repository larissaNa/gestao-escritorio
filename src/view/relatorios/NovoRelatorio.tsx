import { FileText, ArrowLeft, Loader2, Save } from 'lucide-react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Textarea } from '@/view/components/ui/textarea';
import { Label } from '@/view/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { useNovoRelatorio, demandas, tiposAcao, setores } from '@/viewmodel/relatorios/useNovoRelatorioViewModel';

const NovoRelatorio = () => {
  const {
    formData,
    setFormData,
    loading,
    error,
    isEditing,
    handleDemandaChange,
    handleSubmit,
    handleCancel
  } = useNovoRelatorio();

  return (
    <div className="space-y-6">
      <PageHeader 
        title={isEditing ? 'Editar Relatório' : 'Novo Relatório'} 
        description={isEditing ? 'Atualize as informações do relatório abaixo.' : 'Preencha os dados para cadastrar um novo relatório.'}
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

        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Dados do Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Demanda</Label>
                  <Select 
                    value={formData.demanda} 
                    onValueChange={handleDemandaChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a demanda" />
                    </SelectTrigger>
                    <SelectContent>
                      {demandas.map((d) => (
                        <SelectItem key={d.nome} value={d.nome}>
                          {d.nome} ({d.pontos} pts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Protocolo (Opcional)</Label>
                  <Input 
                    value={formData.protocolo}
                    onChange={(e) => setFormData(prev => ({ ...prev, protocolo: e.target.value }))}
                    placeholder="Número do protocolo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input 
                  value={formData.cliente}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                  placeholder="Nome do cliente"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Ação</Label>
                  <Select 
                    value={formData.tipo_acao} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, tipo_acao: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de ação" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposAcao.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Setor</Label>
                  <Select 
                    value={formData.setor} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, setor: val }))}
                  >
                    <SelectTrigger>
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

              <div className="space-y-2">
                <Label>Observação</Label>
                <Textarea 
                  value={formData.observacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                  placeholder="Observações adicionais"
                  className="min-h-[100px]"
                />
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

export default NovoRelatorio;
