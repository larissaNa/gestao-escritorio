import { Award, ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Label } from '@/view/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { useNovoBeneficio } from '@/viewmodel/beneficios/useNovoBeneficioViewModel';
import { BeneficioItem } from '@/model/entities';

import { PageHeader } from '@/view/components/layout/PageHeader';

const NovoBeneficio = () => {
  const {
    formData,
    setFormData,
    loading,
    error,
    isEditing,
    responsaveis,
    handleSubmit,
    handleCancel
  } = useNovoBeneficio();

  return (
    <div className="space-y-6">
      <PageHeader 
        title={isEditing ? 'Editar Benefício' : 'Novo Benefício'} 
        description={isEditing ? 'Atualize as informações do benefício abaixo.' : 'Preencha os dados para cadastrar um novo benefício.'}
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
            <CardTitle>Dados do Benefício</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Benefício *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value as BeneficioItem['tipo'] })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="Judicial">Judicial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtipo">Subtipo</Label>
                  <Input
                    id="subtipo"
                    value={formData.subtipo}
                    onChange={(e) => setFormData({ ...formData, subtipo: e.target.value })}
                    placeholder="Ex: Revisão"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável *</Label>
                <Select
                  value={formData.responsavelUID}
                  onValueChange={(value) => setFormData({ ...formData, responsavelUID: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {responsaveis.map((resp) => (
                      <SelectItem key={resp.id} value={resp.id}>{resp.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  placeholder="Nome do cliente"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
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

export default NovoBeneficio;
