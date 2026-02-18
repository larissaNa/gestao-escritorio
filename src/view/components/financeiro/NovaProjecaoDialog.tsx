import { useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/view/components/ui/dialog";
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/view/components/ui/select";
import { ProjecaoFinanceira } from "@/model/entities";
import { ClientSelect } from './ClientSelect';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface NovaProjecaoDialogProps {
  onSave: (projecao: Omit<ProjecaoFinanceira, 'id'>) => Promise<boolean>;
}

export function NovaProjecaoDialog({ onSave }: NovaProjecaoDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [clienteNome, setClienteNome] = useState('');

  const { register, handleSubmit, control, reset, setValue } = useForm<Omit<ProjecaoFinanceira, 'id' | 'cliente' | 'clienteId' | 'dataPrevista'>>();

  const onSubmit = async (data: any) => {
    // Cliente é opcional para projeção, mas recomendado
    
    setLoading(true);
    try {
      const novaProjecao: Omit<ProjecaoFinanceira, 'id'> = {
        ...data,
        valorEstimado: Number(data.valorEstimado),
        dataPrevista: new Date(data.dataPrevista),
        cliente: clienteNome,
        clienteId: clienteId,
      };

      await onSave(novaProjecao);
      toast.success("Projeção adicionada com sucesso!");
      setOpen(false);
      reset();
      setClienteId('');
      setClienteNome('');
    } catch (error) {
      toast.error("Erro ao adicionar projeção");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus className="mr-2 h-4 w-4" />
          Nova Projeção
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Projeção</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" {...register("descricao", { required: true })} placeholder="Ex: Honorários Êxito Processo X" />
          </div>
          
          <div className="grid gap-2">
            <Label>Cliente (Opcional)</Label>
            <ClientSelect 
              value={clienteId} 
              onChange={(id, nome) => {
                setClienteId(id);
                setClienteNome(nome);
              }} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="valorEstimado">Valor Estimado</Label>
              <Input id="valorEstimado" type="number" step="0.01" {...register("valorEstimado", { required: true })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="probabilidade">Probabilidade</Label>
              <Controller
                name="probabilidade"
                control={control}
                defaultValue="media"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dataPrevista">Data Prevista</Label>
            <Input id="dataPrevista" type="date" {...register("dataPrevista", { required: true })} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="origem">Origem</Label>
            <Input id="origem" {...register("origem", { required: true })} placeholder="Ex: Processo Trabalhista" />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Projeção"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


