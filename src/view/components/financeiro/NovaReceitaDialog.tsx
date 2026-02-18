import { useState } from 'react';
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/view/components/ui/dialog";
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/view/components/ui/select";
import { Receita } from "@/model/entities";
import { ClientSelect } from './ClientSelect';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface NovaReceitaDialogProps {
  onSave: (receita: Omit<Receita, 'id'>) => Promise<boolean>;
}

export function NovaReceitaDialog({ onSave }: NovaReceitaDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [clienteNome, setClienteNome] = useState('');

  const { register, handleSubmit, reset, setValue } = useForm<Omit<Receita, 'id' | 'cliente' | 'clienteId' | 'dataVencimento'>>();

  const onSubmit = async (data: any) => {
    if (!clienteId) {
      toast.error("Selecione um cliente");
      return;
    }

    setLoading(true);
    try {
      const novaReceita: Omit<Receita, 'id'> = {
        ...data,
        valorTotal: Number(data.valorTotal),
        valorPago: Number(data.valorPago),
        valorAberto: Number(data.valorTotal) - Number(data.valorPago),
        dataVencimento: new Date(data.dataVencimento),
        cliente: clienteNome,
        clienteId: clienteId,
        status: Number(data.valorPago) >= Number(data.valorTotal) ? 'pago' : 'pendente'
      };

      await onSave(novaReceita);
      toast.success("Receita adicionada com sucesso!");
      setOpen(false);
      reset();
      setClienteId('');
      setClienteNome('');
    } catch (error) {
      toast.error("Erro ao adicionar receita");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Receita
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Receita</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" {...register("descricao", { required: true })} placeholder="Ex: Honorários Mensais" />
          </div>
          
          <div className="grid gap-2">
            <Label>Cliente</Label>
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
              <Label htmlFor="valorTotal">Valor Total</Label>
              <Input id="valorTotal" type="number" step="0.01" {...register("valorTotal", { required: true })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="valorPago">Valor Pago</Label>
              <Input id="valorPago" type="number" step="0.01" defaultValue={0} {...register("valorPago", { required: true })} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dataVencimento">Vencimento</Label>
            <Input id="dataVencimento" type="date" {...register("dataVencimento", { required: true })} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="origem">Origem</Label>
            <Input id="origem" {...register("origem", { required: true })} placeholder="Ex: Contrato 2024" />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Receita"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


