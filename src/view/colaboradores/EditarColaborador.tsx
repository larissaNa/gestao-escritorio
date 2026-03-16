import React from 'react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { useEditarColaboradorViewModel } from '@/viewmodel/colaboradores/useEditarColaboradorViewModel';
import { User, Phone, Mail, Briefcase, ArrowLeft, Save, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/view/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/view/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/view/components/ui/alert";
import { Checkbox } from "@/view/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/view/components/ui/radio-group";

const EditarColaborador: React.FC = () => {
  const {
    loading,
    saving,
    error,
    formData,
    userType,
    setUserType,
    userPermissions,
    togglePermission,
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
              <div className="md:col-span-2 space-y-3 pt-2">
                <Label>Tipo de Usuário</Label>
                <RadioGroup value={userType} onValueChange={(v) => setUserType(v as 'comum' | 'admin')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comum" id="edit-user-type-comum" />
                    <Label htmlFor="edit-user-type-comum">Usuário comum</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="edit-user-type-admin" />
                    <Label htmlFor="edit-user-type-admin">Administrador</Label>
                  </div>
                </RadioGroup>
              </div>

              {userType === 'comum' && (
                <div className="md:col-span-2 space-y-3">
                  <Label>Permissões do usuário comum</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-perm-dashboard"
                        checked={userPermissions.includes('dashboard')}
                        onCheckedChange={() => togglePermission('dashboard')}
                      />
                      <Label htmlFor="edit-perm-dashboard">Dashboard</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-perm-atendimentos"
                        checked={userPermissions.includes('atendimentos')}
                        onCheckedChange={() => togglePermission('atendimentos')}
                      />
                      <Label htmlFor="edit-perm-atendimentos">Atendimentos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-perm-relatorios"
                        checked={userPermissions.includes('relatorios')}
                        onCheckedChange={() => togglePermission('relatorios')}
                      />
                      <Label htmlFor="edit-perm-relatorios">Relatórios</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-perm-servicos"
                        checked={userPermissions.includes('servicos')}
                        onCheckedChange={() => togglePermission('servicos')}
                      />
                      <Label htmlFor="edit-perm-servicos">Tabela Serviços</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-perm-cadastro"
                        checked={userPermissions.includes('cadastro')}
                        onCheckedChange={() => togglePermission('cadastro')}
                      />
                      <Label htmlFor="edit-perm-cadastro">Cadastro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-perm-acoes-advogados"
                        checked={userPermissions.includes('acoes_advogados')}
                        onCheckedChange={() => togglePermission('acoes_advogados')}
                      />
                      <Label htmlFor="edit-perm-acoes-advogados">Ações Advogados</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-perm-processos-advogados"
                        checked={userPermissions.includes('processos_advogados')}
                        onCheckedChange={() => togglePermission('processos_advogados')}
                      />
                      <Label htmlFor="edit-perm-processos-advogados">Processos/Advogados</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-perm-financeiro"
                        checked={userPermissions.includes('financeiro')}
                        onCheckedChange={() => togglePermission('financeiro')}
                      />
                      <Label htmlFor="edit-perm-financeiro">Financeiro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-perm-idas-banco"
                        checked={userPermissions.includes('idas_banco')}
                        onCheckedChange={() => togglePermission('idas_banco')}
                      />
                      <Label htmlFor="edit-perm-idas-banco">Idas ao Banco</Label>
                    </div>
                  </div>
                </div>
              )}
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
