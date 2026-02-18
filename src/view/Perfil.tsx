import React from 'react';
import { usePerfil } from '@/viewmodel/usePerfilViewModel';
import { User, Edit2, Save, X, Loader2, Briefcase, MapPin, FileText } from 'lucide-react';
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/view/components/ui/card";
import { Separator } from "@/view/components/ui/separator";

const Profile: React.FC = () => {
  const {
    user,
    colaboradorName,
    profileData,
    editingData,
    loading,
    saving,
    isEditing,
    error,
    handleEdit,
    handleCancelEdit,
    handleSave,
    handleInputChange,
    formatDate,
    formatDateDisplay
  } = usePerfil();

  if (!user) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
        Usuário não autenticado. Faça login para continuar.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <User className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
        </div>
        
        {profileData && !isEditing && (
          <Button onClick={handleEdit} className="gap-2">
            <Edit2 className="h-4 w-4" />
            Editar Perfil
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20 mb-4">
          {error}
        </div>
      )}

      {profileData ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card de Perfil Resumido */}
          <div className="md:col-span-4">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg text-4xl font-bold text-muted-foreground">
                    {colaboradorName ? colaboradorName.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center mb-1">
                  {colaboradorName || 'Nome não informado'}
                </h3>
                <p className="text-muted-foreground text-center text-sm mb-4">
                  {user.email}
                </p>
                
                <div className="w-full space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{profileData.funcaoCargo || 'Cargo não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profileData.cidade ? `${profileData.cidade}, ${profileData.rua}` : 'Localização não informada'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card de Detalhes Editáveis */}
          <div className="md:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing ? 'Editando Informações' : 'Informações Pessoais e Profissionais'}
                </CardTitle>
                <CardDescription>
                  Gerencie seus dados pessoais e informações de trabalho.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Seção Pessoal */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informações Pessoais
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <Label>Primeiro Nome</Label>
                          <Input
                            value={editingData?.primeiroNome || ''}
                            onChange={(e) => handleInputChange('primeiroNome', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Sobrenome</Label>
                          <Input
                            value={editingData?.sobreNome || ''}
                            onChange={(e) => handleInputChange('sobreNome', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CPF</Label>
                          <Input
                            value={editingData?.cpf || ''}
                            onChange={(e) => handleInputChange('cpf', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>RG</Label>
                          <Input
                            value={editingData?.rg || ''}
                            onChange={(e) => handleInputChange('rg', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Data de Nascimento</Label>
                          <Input
                            type="date"
                            value={formatDate(editingData?.dataNascimento)}
                            onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Telefone</Label>
                          <Input
                            value={editingData?.telefonePessoal || ''}
                            onChange={(e) => handleInputChange('telefonePessoal', e.target.value)}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Nome Completo</Label>
                          <p className="font-medium">{profileData.primeiroNome} {profileData.sobreNome}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">CPF</Label>
                          <p className="font-medium">{profileData.cpf || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">RG</Label>
                          <p className="font-medium">{profileData.rg || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Data de Nascimento</Label>
                          <p className="font-medium">{formatDateDisplay(profileData.dataNascimento)}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Telefone</Label>
                          <p className="font-medium">{profileData.telefonePessoal || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Email</Label>
                          <p className="font-medium">{profileData.emailPessoal || user.email}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Seção Profissional */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Informações Profissionais
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <Label>Função/Cargo</Label>
                          <Input
                            value={editingData?.funcaoCargo || ''}
                            onChange={(e) => handleInputChange('funcaoCargo', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Departamento</Label>
                          <Input
                            value={editingData?.departamento || ''}
                            onChange={(e) => handleInputChange('departamento', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Data de Ingresso</Label>
                          <Input
                            type="date"
                            value={formatDate(editingData?.dataIngresso)}
                            onChange={(e) => handleInputChange('dataIngresso', e.target.value)}
                          />
                        </div>
                        {profileData.numeroOAB && (
                          <div className="space-y-2">
                            <Label>Número OAB</Label>
                            <Input
                              value={editingData?.numeroOAB || ''}
                              onChange={(e) => handleInputChange('numeroOAB', e.target.value)}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Função/Cargo</Label>
                          <p className="font-medium">{profileData.funcaoCargo || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Departamento</Label>
                          <p className="font-medium">{profileData.departamento || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Data de Ingresso</Label>
                          <p className="font-medium">{formatDateDisplay(profileData.dataIngresso)}</p>
                        </div>
                        {profileData.numeroOAB && (
                          <div className="space-y-1">
                            <Label className="text-muted-foreground">Número OAB</Label>
                            <p className="font-medium">{profileData.numeroOAB}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <Separator />
                
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Endereço
                  </h4>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>CEP</Label>
                          <Input
                            value={editingData?.cep || ''}
                            onChange={(e) => handleInputChange('cep', e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label>Rua</Label>
                          <Input
                            value={editingData?.rua || ''}
                            onChange={(e) => handleInputChange('rua', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Número</Label>
                          <Input
                            value={editingData?.numero || ''}
                            onChange={(e) => handleInputChange('numero', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bairro</Label>
                          <Input
                            value={editingData?.bairro || ''}
                            onChange={(e) => handleInputChange('bairro', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Cidade</Label>
                          <Input
                            value={editingData?.cidade || ''}
                            onChange={(e) => handleInputChange('cidade', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Logradouro</Label>
                        <p className="font-medium">
                          {profileData.rua ? `${profileData.rua}, ${profileData.numero || 'S/N'}` : 'N/A'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Bairro</Label>
                        <p className="font-medium">{profileData.bairro || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Cidade</Label>
                        <p className="font-medium">{profileData.cidade || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">CEP</Label>
                        <p className="font-medium">{profileData.cep || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Formulário não preenchido</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Você ainda não preencheu o formulário de colaborador. Preencha suas informações para visualizar seu perfil completo.
            </p>
            <Button asChild>
              <a href="/formulario">Preencher Formulário</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;


