import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/view/components/ui/dialog";
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/view/components/ui/select";
import { Receita } from "@/model/entities";
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useConfigListOptions } from '@/viewmodel/configLists/useConfigListOptions';
import { parseDateInput } from '@/lib/utils';

interface NovaReceitaDialogProps {
  onSave: (receita: Omit<Receita, 'id'>) => Promise<boolean>;
  disabled?: boolean;
  defaultEscritorio?: string;
}

export function NovaReceitaDialog({ onSave, disabled, defaultEscritorio }: NovaReceitaDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { options: categoriasOptions } = useConfigListOptions('categoria', { activeOnly: true });
  const { options: subcategoriasOptions } = useConfigListOptions('subcategoria', { activeOnly: true });
  const { options: escritoriosOptions, loading: loadingEscritorios } = useConfigListOptions("escritorios", { activeOnly: true });

  const { register, handleSubmit, reset, control, setValue, watch } = useForm<Omit<Receita, 'id'>>();

  const selectedCategoria = watch("categoria");

  const filteredSubcategorias = useMemo(() => {
    if (!selectedCategoria) return [];
    return subcategoriasOptions.filter(s => s.parentId === selectedCategoria);
  }, [selectedCategoria, subcategoriasOptions]);

  useEffect(() => {
    if (!open) return;
    if (defaultEscritorio) return;
    if (escritoriosOptions.length === 0) return;
    setValue("escritorio", escritoriosOptions[0].value, { shouldDirty: false, shouldTouch: false });
  }, [defaultEscritorio, escritoriosOptions, open, setValue]);

  useEffect(() => {
    // Limpar subcategoria se a categoria mudar e a subcategoria atual não for mais válida
    const currentSub = watch("subcategoria");
    if (currentSub && !filteredSubcategorias.some(s => s.value === currentSub)) {
      setValue("subcategoria", "");
    }
  }, [selectedCategoria, filteredSubcategorias, setValue, watch]);

  const onSubmit = async (data: Omit<Receita, 'id'>) => {
    setLoading(true);
    try {
      const novaReceita: Omit<Receita, 'id'> = {
        ...data,
        escritorio: data.escritorio || defaultEscritorio,
        valorTotal: Number(data.valorTotal),
        valorPago: Number(data.valorPago),
        valorAberto: Number(data.valorTotal) - Number(data.valorPago),
        dataVencimento: parseDateInput(String(data.dataVencimento)),
        categoria: data.categoria,
        subcategoria: data.subcategoria,
        status: Number(data.valorPago) >= Number(data.valorTotal) ? 'pago' : 'pendente',
        origem: "" // Campo removido, mas mantido vazio para compatibilidade se necessário
      };

      await onSave(novaReceita);
      toast.success("Receita adicionada com sucesso!");
      setOpen(false);
      reset();
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
        <Button disabled={disabled}>
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
            <Label htmlFor="categoria">Categoria</Label>
            <Controller
              name="categoria"
              control={control}
              rules={{ required: true }}
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
          
          <div className="grid gap-2">
            <Label htmlFor="subcategoria">Subcategoria</Label>
            <Controller
              name="subcategoria"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!selectedCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedCategoria ? "Selecione" : "Selecione uma categoria primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubcategorias.map((opt) => (
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
            <Input id="descricao" {...register("descricao", { required: true })} placeholder="Ex: Honorários Mensais" />
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

          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Receita"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
