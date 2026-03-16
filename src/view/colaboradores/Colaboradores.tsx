import React from 'react';
import { useColaboradoresViewModel } from '@/viewmodel/colaboradores/useColaboradoresViewModel';
import { Users, ShieldAlert, Edit2, Trash2, UserCheck, UserX, Loader2, Search } from 'lucide-react';
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Badge } from "@/view/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/view/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/view/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/view/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/view/components/ui/alert-dialog";

import { PageHeader } from '@/view/components/layout/PageHeader';

const Colaboradores: React.FC = () => {
  const {
    user,
    isAdmin,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    showDeleteDialog,
    setShowDeleteDialog,
    deleting,
    userToDelete,
    confirmDelete,
    handleDeleteUser,
    getRoleBadgeVariant,
    isFormComplete,
    filteredColaboradores,
    navigateToCreate,
    navigateToEdit
  } = useColaboradoresViewModel();

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
    <div className="space-y-6">
      <PageHeader 
        title="Gerenciar Colaboradores" 
        description="Administração de usuários e permissões."
      >
        <Button onClick={navigateToCreate} className="gap-2">
          <UserCheck className="h-4 w-4" />
          Novo Colaborador
        </Button>
      </PageHeader>

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
                Total de {filteredColaboradores.length} colaboradores encontrados.
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
                  <TableHead className="hidden lg:table-cell">Função</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColaboradores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum colaborador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredColaboradores.map((colaborador) => (
                    <TableRow key={colaborador.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{colaborador.primeiroNome} {colaborador.sobreNome}</span>
                          <span className="text-xs text-muted-foreground">{colaborador.email || colaborador.emailPessoal || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-col">
                          <span>{colaborador.funcaoCargo || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{colaborador.departamento}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(colaborador.role)}>
                          {colaborador.role === 'admin' ? 'Administrador' : 'Comum'}
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
                            onClick={() => colaborador.id && navigateToEdit(colaborador.id)}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o colaborador
              <span className="font-semibold"> {userToDelete?.primeiroNome} {userToDelete?.sobreNome} </span>
              e todos os seus dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Colaboradores;
