import { useMemo, useState } from 'react';
import { ShieldAlert, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Button } from '@/view/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Input } from '@/view/components/ui/input';
import { Label } from '@/view/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/view/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/view/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/view/components/ui/alert-dialog';
import type { ConfigListItem, ConfigListKey } from '@/model/entities';
import { useConfigListsAdminViewModel } from '@/viewmodel/configLists/useConfigListsAdminViewModel';

type EditDraft = {
  id?: string;
  label: string;
  pontos?: string;
  order: string;
  active: boolean;
  cidade?: string;
  estado?: string;
};

const toDraft = (item: ConfigListItem): EditDraft => {
  const parsed = item.label.includes(' - ') ? item.label.split(' - ') : null;
  const cidadeFallback = parsed?.[0]?.trim() ?? '';
  const estadoFallback = parsed?.[1]?.trim() ?? '';

  return {
    id: item.id,
    label: item.label,
    pontos: typeof item.pontos === 'number' ? String(item.pontos) : '',
    order: String(item.order ?? 0),
    active: item.active,
    cidade: item.cidade ?? cidadeFallback,
    estado: item.estado ?? estadoFallback,
  };
};

const Listas = () => {
  const { user, isAdmin } = useAuth();
  const { definitions, activeKey, setActiveKey, activeDefinition, items, loading, createItem, updateItem, deleteItem } =
    useConfigListsAdminViewModel();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [draft, setDraft] = useState<EditDraft>({
    label: '',
    pontos: '',
    order: '0',
    active: true,
    cidade: '',
    estado: '',
  });
  const [deleteTarget, setDeleteTarget] = useState<ConfigListItem | null>(null);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const ao = typeof a.order === 'number' ? a.order : 0;
      const bo = typeof b.order === 'number' ? b.order : 0;
      if (ao !== bo) return ao - bo;
      return a.label.localeCompare(b.label, 'pt-BR');
    });
  }, [items]);

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

  const supportsPontos = Boolean(activeDefinition.supportsPontos);
  const supportsCidadeEstado = Boolean(activeDefinition.supportsCidadeEstado);

  const handleOpenCreate = () => {
    setDraft({
      label: '',
      pontos: '',
      order: String(sortedItems.length ? Math.max(...sortedItems.map((i) => i.order ?? 0)) + 1 : 1),
      active: true,
      cidade: '',
      estado: '',
    });
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    const pontos = supportsPontos && draft.pontos ? Number(draft.pontos) : undefined;
    if (supportsCidadeEstado) {
      await createItem({ cidade: draft.cidade, estado: draft.estado });
    } else {
      await createItem({ label: draft.label, pontos });
    }
    setCreateOpen(false);
  };

  const handleOpenEdit = (item: ConfigListItem) => {
    setDraft(toDraft(item));
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!draft.id) return;
    const pontos = supportsPontos ? (draft.pontos ? Number(draft.pontos) : undefined) : undefined;
    const order = Number(draft.order);
    await updateItem(draft.id, {
      label: supportsCidadeEstado ? undefined : draft.label,
      cidade: supportsCidadeEstado ? draft.cidade : undefined,
      estado: supportsCidadeEstado ? draft.estado : undefined,
      active: draft.active,
      order: Number.isFinite(order) ? order : 0,
      pontos,
    });
    setEditOpen(false);
  };

  const handleToggleActive = async (item: ConfigListItem) => {
    await updateItem(item.id, { active: !item.active });
  };

  const handleAskDelete = (item: ConfigListItem) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteItem(deleteTarget.id);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleKeyChange = (val: string) => {
    setActiveKey(val as ConfigListKey);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciar Listas do Sistema"
        description="Cadastre opções que aparecem nos selects do sistema."
      >
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Opção
        </Button>
      </PageHeader>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base font-medium">Lista</CardTitle>
            <div className="w-full md:w-80">
              <Select value={activeKey} onValueChange={handleKeyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {definitions.map((d) => (
                    <SelectItem key={d.key} value={d.key}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    {supportsPontos && <TableHead className="text-right">Pontos</TableHead>}
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ordem</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={supportsPontos ? 5 : 4} className="text-center py-10 text-muted-foreground">
                        Nenhuma opção cadastrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.label}</TableCell>
                        {supportsPontos && <TableCell className="text-right">{item.pontos ?? '-'}</TableCell>}
                        <TableCell className="text-center">{item.active ? 'Ativo' : 'Inativo'}</TableCell>
                        <TableCell className="text-right">{item.order ?? 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)} title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(item)}
                              title={item.active ? 'Desativar' : 'Ativar'}
                            >
                              {item.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleAskDelete(item)}
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
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova opção ({activeDefinition.label})</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {supportsCidadeEstado ? (
              <>
                <div className="grid gap-2">
                  <Label>Cidade</Label>
                  <Input value={draft.cidade ?? ''} onChange={(e) => setDraft((p) => ({ ...p, cidade: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Estado</Label>
                  <Input value={draft.estado ?? ''} onChange={(e) => setDraft((p) => ({ ...p, estado: e.target.value }))} />
                </div>
              </>
            ) : (
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input value={draft.label} onChange={(e) => setDraft((p) => ({ ...p, label: e.target.value }))} />
              </div>
            )}
            {supportsPontos && (
              <div className="grid gap-2">
                <Label>Pontos</Label>
                <Input
                  type="number"
                  value={draft.pontos ?? ''}
                  onChange={(e) => setDraft((p) => ({ ...p, pontos: e.target.value }))}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar opção</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {supportsCidadeEstado ? (
              <>
                <div className="grid gap-2">
                  <Label>Cidade</Label>
                  <Input value={draft.cidade ?? ''} onChange={(e) => setDraft((p) => ({ ...p, cidade: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Estado</Label>
                  <Input value={draft.estado ?? ''} onChange={(e) => setDraft((p) => ({ ...p, estado: e.target.value }))} />
                </div>
              </>
            ) : (
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input value={draft.label} onChange={(e) => setDraft((p) => ({ ...p, label: e.target.value }))} />
              </div>
            )}
            {supportsPontos && (
              <div className="grid gap-2">
                <Label>Pontos</Label>
                <Input
                  type="number"
                  value={draft.pontos ?? ''}
                  onChange={(e) => setDraft((p) => ({ ...p, pontos: e.target.value }))}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Ordem</Label>
              <Input
                type="number"
                value={draft.order}
                onChange={(e) => setDraft((p) => ({ ...p, order: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={draft.active ? 'ativo' : 'inativo'} onValueChange={(val) => setDraft((p) => ({ ...p, active: val === 'ativo' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a opção{' '}
              <span className="font-semibold">{deleteTarget?.label}</span>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Listas;
