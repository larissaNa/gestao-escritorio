import React from 'react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { useEditarColaboradorViewModel } from '@/viewmodel/colaboradores/useEditarColaboradorViewModel';
import { User, Phone, Mail, Briefcase, ArrowLeft, Save, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/view/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/view/components/ui/select";
import { Separator } from "@/view/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/view/components/ui/alert";

const EditarColaborador: React.FC = () => {
  const {
    loading,
    saving,
    error,
    formData,
    handleInputChange,
    handleSave,
    handleCancel
  } = useEditarColaboradorViewModel();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>Colaborador não encontrado.</AlertDescription>
        </Alert>
        <Button onClick={handleCancel} className="mt-4">Voltar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Editar Colaborador" 
        description="Atualize as informações do colaborador."
      >
        <Button variant="outline" onClick={handleCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </PageHeader>

      <div className="max-w-4xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Seção Pessoal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" /> Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primeiro Nome</Label>
                <Input
                  value={formData.primeiroNome || ''}
                  onChange={(e) => handleInputChange('primeiroNome', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Sobrenome</Label>
                <Input
                  value={formData.sobreNome || ''}
                  onChange={(e) => handleInputChange('sobreNome', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  value={formData.cpf || ''}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>RG</Label>
                <Input
                  value={formData.rg || ''}
                  onChange={(e) => handleInputChange('rg', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    value={formData.telefonePessoal || ''}
                    onChange={(e) => handleInputChange('telefonePessoal', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email (Apenas visualização)</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    value={formData.email || ''}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção Profissional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-primary" /> Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Função/Cargo</Label>
                <Input
                  value={formData.funcaoCargo || ''}
                  onChange={(e) => handleInputChange('funcaoCargo', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select 
                  value={formData.departamento || ''} 
                  onValueChange={(value) => handleInputChange('departamento', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jurídico">Jurídico</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role (Permissão)</Label>
                <Select 
                  value={formData.role || 'recepcao'} 
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="advogado">Advogado</SelectItem>
                    <SelectItem value="recepcao">Recepção</SelectItem>
                    <SelectItem value="estagiario">Estagiário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarColaborador;
