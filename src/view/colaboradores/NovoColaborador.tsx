import React from 'react';
import { useNovoColaboradorViewModel } from '@/viewmodel/colaboradores/useNovoColaboradorViewModel';
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/view/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/view/components/ui/alert";
import { Checkbox } from "@/view/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/view/components/ui/radio-group";

import { PageHeader } from '@/view/components/layout/PageHeader';

const NovoColaborador: React.FC = () => {
  const {
    loading,
    error,
    newUserEmail,
    setNewUserEmail,
    newUserPassword,
    setNewUserPassword,
    newUserName,
    setNewUserName,
    newUserType,
    setNewUserType,
    newUserPermissions,
    togglePermission,
    handleCreateUser,
    handleCancel
  } = useNovoColaboradorViewModel();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Novo Colaborador" 
        description="Crie um novo usuário para acessar o sistema."
      >
        <Button variant="outline" onClick={handleCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </PageHeader>

      <div className="max-w-2xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Dados de Acesso</CardTitle>
            <CardDescription>
              O usuário receberá um email de verificação após o cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex: João Silva"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Ex: joao@exemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha Provisória</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-3">
                <Label>Tipo de Usuário</Label>
                <RadioGroup value={newUserType} onValueChange={(v) => setNewUserType(v as 'comum' | 'admin')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comum" id="user-type-comum" />
                    <Label htmlFor="user-type-comum">Usuário comum</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="user-type-admin" />
                    <Label htmlFor="user-type-admin">Administrador</Label>
                  </div>
                </RadioGroup>
              </div>

              {newUserType === 'comum' && (
                <div className="space-y-3">
                  <Label>Permissões do usuário comum</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-dashboard"
                        checked={newUserPermissions.includes('dashboard')}
                        onCheckedChange={() => togglePermission('dashboard')}
                      />
                      <Label htmlFor="perm-dashboard">Dashboard</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-atendimentos"
                        checked={newUserPermissions.includes('atendimentos')}
                        onCheckedChange={() => togglePermission('atendimentos')}
                      />
                      <Label htmlFor="perm-atendimentos">Atendimentos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-relatorios"
                        checked={newUserPermissions.includes('relatorios')}
                        onCheckedChange={() => togglePermission('relatorios')}
                      />
                      <Label htmlFor="perm-relatorios">Relatórios</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-servicos"
                        checked={newUserPermissions.includes('servicos')}
                        onCheckedChange={() => togglePermission('servicos')}
                      />
                      <Label htmlFor="perm-servicos">Tabela Serviços</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-cadastro"
                        checked={newUserPermissions.includes('cadastro')}
                        onCheckedChange={() => togglePermission('cadastro')}
                      />
                      <Label htmlFor="perm-cadastro">Cadastro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-acoes-advogados"
                        checked={newUserPermissions.includes('acoes_advogados')}
                        onCheckedChange={() => togglePermission('acoes_advogados')}
                      />
                      <Label htmlFor="perm-acoes-advogados">Ações Advogados</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-processos-advogados"
                        checked={newUserPermissions.includes('processos_advogados')}
                        onCheckedChange={() => togglePermission('processos_advogados')}
                      />
                      <Label htmlFor="perm-processos-advogados">Processos/Advogados</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-financeiro"
                        checked={newUserPermissions.includes('financeiro')}
                        onCheckedChange={() => togglePermission('financeiro')}
                      />
                      <Label htmlFor="perm-financeiro">Financeiro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="perm-idas-banco"
                        checked={newUserPermissions.includes('idas_banco')}
                        onCheckedChange={() => togglePermission('idas_banco')}
                      />
                      <Label htmlFor="perm-idas-banco">Idas ao Banco</Label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Usuário
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovoColaborador;
