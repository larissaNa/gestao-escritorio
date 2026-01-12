import React from 'react';
import { useIdasBanco } from '@/hooks/useIdasBanco';
import { Plus, Trash2, Edit2,Search, Landmark, User,Hash} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui/table";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter,DialogDescription,} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const IdasBanco: React.FC = () => {
  const {
    loading,
    showModal,
    setShowModal,
    saving,
    searchTerm,
    setSearchTerm,
    editingId,
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
    handleEdit,
    handleDelete,
    resetForm,
    filteredIdas
  } = useIdasBanco();

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Idas ao Banco</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e agende as idas ao banco com clientes.
          </p>
        </div>
        <div onClick={() => {
          resetForm();
          setShowModal(true);
        }}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova Ida
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Histórico de Idas</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, banco..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredIdas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro encontrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Ida Nº</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIdas.map((ida) => (
                  <TableRow key={ida.id}>
                    <TableCell>
                      {format(ida.dataIda, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">{ida.clienteNome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                        {ida.banco}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        {ida.numeroIda}ª vez
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {ida.responsavelNome}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(ida)}
                        className="mr-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(ida.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Ida ao Banco' : 'Nova Ida ao Banco'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Edite os dados da ida ao banco.' : 'Preencha os dados para agendar ou registrar uma ida ao banco.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-4 py-4">
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IdasBanco;