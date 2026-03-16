import { useEffect, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/view/components/ui/dialog";
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/view/components/ui/select";
import { Checkbox } from "@/view/components/ui/checkbox";
import { CustoServico } from "@/model/entities";
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useConfigListOptions } from '@/viewmodel/configLists/useConfigListOptions';

interface NovoCustoDialogProps {
  onSave: (custo: Omit<CustoServico, 'id'>) => Promise<boolean>;
  disabled?: boolean;
  defaultEscritorio?: string;
}

export function NovoCustoDialog({ onSave, disabled, defaultEscritorio }: NovoCustoDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { options: categoriasOptions } = useConfigListOptions('categoria', { activeOnly: true });
  const { options: escritoriosOptions, loading: loadingEscritorios } = useConfigListOptions("escritorios", { activeOnly: true });

  const { register, handleSubmit, control, reset, setValue } = useForm<Omit<CustoServico, 'id'>>();

  useEffect(() => {
    if (!open) return;
    if (defaultEscritorio) return;
    if (escritoriosOptions.length === 0) return;
    setValue("escritorio", escritoriosOptions[0].value, { shouldDirty: false, shouldTouch: false });
  }, [defaultEscritorio, escritoriosOptions, open, setValue]);

  const onSubmit = async (data: Omit<CustoServico, 'id'>) => {
    // Cliente é opcional para custo
    setLoading(true);
    try {
      const novoCusto: Omit<CustoServico, 'id'> = {
        ...data,
        escritorio: data.escritorio || defaultEscritorio,
        valor: Number(data.valor),
        data: new Date(data.data as unknown as string),
        subcategoria: data.subcategoria,
      };

      await onSave(novoCusto);
      toast.success("Custo adicionado com sucesso!");
      setOpen(false);
      reset();
    } catch (error) {
      toast.error("Erro ao adicionar custo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={disabled}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Custo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Custo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Escritório</Label>
            <Controller
              name="escritorio"
              control={control}
              defaultValue={defaultEscritorio || ""}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={loadingEscritorios || escritoriosOptions.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingEscritorios ? "Carregando..." : "Selecione"} />
                  </SelectTrigger>
                  <SelectContent>
                    {escritoriosOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" {...register("descricao", { required: true })} placeholder="Ex: Taxa de Protocolo" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="subcategoria">Subcategoria (Opcional)</Label>
            <Input
              id="subcategoria"
              {...register("subcategoria")}
              placeholder="Ex: Cartório"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="valor">Valor</Label>
              <Input id="valor" type="number" step="0.01" {...register("valor", { required: true })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Controller
                name="categoria"
                control={control}
                defaultValue="outros"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="data">Data</Label>
            <Input id="data" type="date" {...register("data", { required: true })} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="origem">Origem</Label>
            <Input id="origem" {...register("origem", { required: true })} placeholder="Ex: Processo Civil" />
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="pago"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <Checkbox 
                  id="pago" 
                  checked={field.value} 
                  onCheckedChange={field.onChange} 
                />
              )}
            />
            <Label htmlFor="pago">Já foi pago?</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="recorrente"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <Checkbox 
                  id="recorrente" 
                  checked={field.value} 
                  onCheckedChange={field.onChange} 
                />
              )}
            />
            <Label htmlFor="recorrente">É recorrente?</Label>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Custo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


