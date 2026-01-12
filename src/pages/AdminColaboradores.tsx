import React from 'react';
import { useAdminColaboradores } from '@/hooks/useAdminColaboradores';
import { Users, ShieldAlert, Edit2, Trash2, UserCheck,UserX,Loader2,Briefcase,Phone,Mail,User,Search} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui/table";
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,} from "@/components/ui/dialog";
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,} from "@/components/ui/alert-dialog";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const AdminColaboradores: React.FC = () => {
  const {
    user,
    isAdmin,
    colaboradores,
    loading,
    error,
    selectedColaborador,
    setSelectedColaborador,
    showModal,
    setShowModal,
    showCreateModal,
    setShowCreateModal,
    isEditing,
    editingData,
    saving,
    searchTerm,
    setSearchTerm,
    showDeleteDialog,
    setShowDeleteDialog,
    deleting,
    userToDelete,
    newUserEmail,
    setNewUserEmail,
    newUserPassword,
    setNewUserPassword,
    newUserName,
    setNewUserName,
    newUserRole,
    setNewUserRole,
    creatingUser,
    handleCreateUser,
    handleViewDetails,
    handleEdit,
    handleCancelEdit,
    handleSave,
    confirmDelete,
    handleDeleteUser,
    handleInputChange,
    getRoleBadgeVariant,
    formatDate,
    isFormComplete,
    filteredColaboradores
  } = useAdminColaboradores();

  if (!user) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Acesso Negado</AlertTitle>
        <AlertDescription>Usuário não autenticado. Faça login para continuar.</AlertDescription>
      </Alert>
    );
  }

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Acesso Negado</AlertTitle>
        <AlertDescription>Apenas administradores podem visualizar esta página.</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gerenciar Colaboradores
          </h1>
          <p className="text-muted-foreground">Administração de usuários e permissões.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <UserCheck className="h-4 w-4" />
            Novo Colaborador
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Lista de Colaboradores</CardTitle>
              <CardDescription>
                Total de {colaboradores.length} colaboradores cadastrados.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Função</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColaboradores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum colaborador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredColaboradores.map((colaborador) => (
                    <TableRow key={colaborador.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{colaborador.primeiroNome} {colaborador.sobreNome}</span>
                          <span className="md:hidden text-xs text-muted-foreground">{colaborador.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{colaborador.email || 'N/A'}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-col">
                          <span>{colaborador.funcaoCargo || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{colaborador.departamento}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(colaborador.role) as any}>
                          {colaborador.role || 'recepcao'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {isFormComplete(colaborador) ? (
                          <div className="flex items-center justify-center text-green-600" title="Cadastro Completo">
                            <UserCheck className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-yellow-600" title="Cadastro Incompleto">
                            <UserX className="h-5 w-5" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(colaborador)}
                            title="Ver detalhes"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(colaborador);
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes/Edição */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              {isEditing ? <Edit2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
              {isEditing ? 'Editar Colaborador' : 'Detalhes do Colaborador'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Atualize as informações do colaborador abaixo.' : 'Visualize as informações completas do colaborador.'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-6 pt-2">
            {editingData && (
              <div className="space-y-6">
                {/* Seção Pessoal */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" /> Informações Pessoais
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <Label>Primeiro Nome</Label>
                          <Input
                            value={editingData.primeiroNome || ''}
                            onChange={(e) => handleInputChange('primeiroNome', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Sobrenome</Label>
                          <Input
                            value={editingData.sobreNome || ''}
                            onChange={(e) => handleInputChange('sobreNome', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CPF</Label>
                          <Input
                            value={editingData.cpf || ''}
                            onChange={(e) => handleInputChange('cpf', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>RG</Label>
                          <Input
                            value={editingData.rg || ''}
                            onChange={(e) => handleInputChange('rg', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Telefone</Label>
                          <Input
                            value={editingData.telefonePessoal || ''}
                            onChange={(e) => handleInputChange('telefonePessoal', e.target.value)}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">Nome Completo</Label>
                          <p className="font-medium">{editingData.primeiroNome} {editingData.sobreNome}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">CPF</Label>
                          <p className="font-medium">{editingData.cpf || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">RG</Label>
                          <p className="font-medium">{editingData.rg || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">Telefone</Label>
                          <p className="font-medium flex items-center gap-2">
                            <Phone className="h-3 w-3" /> {editingData.telefonePessoal || 'N/A'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">Email</Label>
                          <p className="font-medium flex items-center gap-2">
                            <Mail className="h-3 w-3" /> {editingData.email || 'N/A'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">Nascimento</Label>
                          <p className="font-medium">{formatDate(editingData.dataNascimento)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Seção Profissional */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Informações Profissionais
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <Label>Função/Cargo</Label>
                          <Input
                            value={editingData.funcaoCargo || ''}
                            onChange={(e) => handleInputChange('funcaoCargo', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Departamento</Label>
                          <Select 
                            value={editingData.departamento || ''} 
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
                            value={editingData.role || 'recepcao'} 
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
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">Função/Cargo</Label>
                          <p className="font-medium">{editingData.funcaoCargo || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">Departamento</Label>
                          <p className="font-medium">{editingData.departamento || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">Role (Permissão)</Label>
                          <Badge variant={getRoleBadgeVariant(editingData.role) as any}>
                            {editingData.role || 'recepcao'}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="p-6 pt-2 border-t mt-auto">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>
                <Edit2 className="mr-2 h-4 w-4" />
                Editar Dados
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação de Usuário */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Crie um novo usuário para acessar o sistema. Ele receberá um email de verificação.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="space-y-4 py-4">
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
              <div className="space-y-2">
                <Label htmlFor="role">Permissão Inicial</Label>
                <Select value={newUserRole} onValueChange={setNewUserRole}>
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creatingUser}>
                {creatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Usuário
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário
              <strong> {userToDelete?.primeiroNome} {userToDelete?.sobreNome} </strong>
              e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteUser();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir Usuário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminColaboradores;
