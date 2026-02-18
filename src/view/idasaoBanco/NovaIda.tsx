import React from 'react';
import { useNovaIdaViewModel } from '@/viewmodel/idasaoBanco/useNovaIdaViewModel';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/view/components/ui/card";
import { ArrowLeft } from 'lucide-react';

const NovaIda: React.FC = () => {
  const {
    loading,
    saving,
    clienteNome,
    setClienteNome,
    banco,
    setBanco,
    dataIda,
    setDataIda,
    numeroIda,
    setNumeroIda,
    colaboradorName,
    user,
    handleSave,
    handleCancel,
    isEditing
  } = useNovaIdaViewModel();

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={isEditing ? 'Editar Ida ao Banco' : 'Nova Ida ao Banco'} 
        description={isEditing ? 'Edite os dados da ida ao banco.' : 'Preencha os dados para agendar ou registrar uma ida ao banco.'}
      >
        <Button variant="outline" onClick={handleCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </PageHeader>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Ida</CardTitle>
          </CardHeader>
          <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Nome do Cliente</Label>
              <Input
                id="cliente"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Ex: João da Silva"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banco">Banco</Label>
                <Input
                  id="banco"
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  placeholder="Ex: Caixa, Banco do Brasil"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <div className="relative">
                  <Input
                    id="data"
                    type="date"
                    value={dataIda}
                    onChange={(e) => setDataIda(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numeroIda">Quantas idas com este cliente?</Label>
                <Input
                  id="numeroIda"
                  type="number"
                  min="1"
                  value={numeroIda}
                  onChange={(e) => setNumeroIda(parseInt(e.target.value))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Calculado automaticamente com base no histórico.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Input
                  value={colaboradorName || user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default NovaIda;
