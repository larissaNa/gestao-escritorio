import { useEffect, useMemo, useState } from 'react';
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
import { parseDateInput } from '@/lib/utils';

interface NovoCustoDialogProps {
  onSave: (custo: Omit<CustoServico, 'id'>) => Promise<boolean>;
  disabled?: boolean;
  defaultEscritorio?: string;
}

export function NovoCustoDialog({ onSave, disabled, defaultEscritorio }: NovoCustoDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { options: categoriasOptions } = useConfigListOptions('categoria', { activeOnly: true });
  const { options: subcategoriasOptions } = useConfigListOptions('subcategoria', { activeOnly: true });
  const { options: escritoriosOptions, loading: loadingEscritorios } = useConfigListOptions("escritorios", { activeOnly: true });

  const { register, handleSubmit, control, reset, setValue, watch } = useForm<Omit<CustoServico, 'id'>>();

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

  const onSubmit = async (data: Omit<CustoServico, 'id'>) => {
    // Cliente é opcional para custo
    setLoading(true);
    try {
      const novoCusto: Omit<CustoServico, 'id'> = {
        ...data,
        escritorio: data.escritorio || defaultEscritorio,
        valor: Number(data.valor),
        data: parseDateInput(String(data.data)),
        categoria: data.categoria,
        subcategoria: data.subcategoria,
        origem: "" // Campo removido, mas mantido vazio para compatibilidade
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
            <Input id="descricao" {...register("descricao", { required: true })} placeholder="Ex: Taxa de Protocolo" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="valor">Valor</Label>
              <Input id="valor" type="number" step="0.01" {...register("valor", { required: true })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" {...register("data", { required: true })} />
            </div>
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


