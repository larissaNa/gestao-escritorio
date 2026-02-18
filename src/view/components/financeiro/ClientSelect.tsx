import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/view/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/view/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/view/components/ui/popover";
import { clienteService } from '@/model/services/clienteService';

interface ClientSelectProps {
  value: string;
  onChange: (value: string, label: string) => void;
}

interface ClientOption {
  value: string; // ID
  label: string; // Name
}

export function ClientSelect({ value, onChange }: ClientSelectProps) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchedLabel, setFetchedLabel] = useState<{id: string, label: string} | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchClients = async (search: string) => {
    setLoading(true);
    try {
      let clientesData;
      // Se tiver termo de busca, usa a busca por nome
      if (search && search.trim().length > 0) {
        clientesData = await clienteService.getClienteByNome(search, 50);
      } else {
        // Se não, busca os primeiros ordenados
        clientesData = await clienteService.getAllClientesOrderedByName(50);
      }
      
      const data = clientesData.map(cliente => ({
        value: cliente.id,
        label: cliente.nome || 'Sem Nome'
      }));
      setClients(data);
    } catch (error) {
      console.error("Erro ao buscar clientes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients("");
  }, []);

  // Busca o label do cliente se ele não estiver na lista atual
  useEffect(() => {
    if (!value) {
        setFetchedLabel(null);
        return;
    }
    // Se já temos o label para este valor, não faz nada
    if (fetchedLabel?.id === value) return;

    // Se está na lista atual, não precisa buscar
    const inList = clients.find(c => c.value === value);
    if (inList) return;

    // Não está na lista e não temos o label, busca no banco
    let active = true;
    clienteService.getClienteById(value).then(c => {
        if (active && c) {
            setFetchedLabel({id: value, label: c.nome});
        }
    });

    return () => { active = false; };
  }, [value, clients, fetchedLabel]);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchClients(val);
    }, 300);
  };

  const displayLabel = clients.find(c => c.value === value)?.label 
                       || (fetchedLabel?.id === value ? fetchedLabel.label : "")
                       || (value ? "Carregando..." : "Selecione um cliente...");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {displayLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar cliente..." 
            value={searchTerm}
            onValueChange={handleSearch}
          />
          <CommandList>
            {loading && <div className="py-6 text-center text-sm">Carregando...</div>}
            {!loading && clients.length === 0 && (
              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            )}
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.value}
                  value={client.label}
                  onSelect={() => {
                    onChange(client.value, client.label);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === client.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {client.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
