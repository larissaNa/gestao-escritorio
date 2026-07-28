import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Label } from '@/view/components/ui/label';
import { Textarea } from '@/view/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Card, CardContent } from '@/view/components/ui/card';
import { useNovoCaminhoClienteViewModel } from '@/viewmodel/caminhoCliente/useNovoCaminhoClienteViewModel';
import { formatarCpf } from '@/utils/masks';
import {
  ETAPAS_CAMINHO,
  SITUACOES_CAMINHO,
  EtapaCaminho,
  SituacaoCaminho,
  SetorResponsavel,
} from '@/model/entities';

const SETORES: SetorResponsavel[] = [
  'Comercial',
  'Recepção',
  'Triagem Jurídica',
  'Jurídico',
  'INSS',
  'Controladoria',
  'Advogado',
  'Financeiro',
  'Arquivo',
];

const NovoCaminhoCliente = () => {
  const { caminho, setCaminho, loading, saving, salvar, isEditing, handleCancel } =
    useNovoCaminhoClienteViewModel();

  if (loading) return <div className="p-8">Carregando...</div>;

  const prazoStr = caminho.prazoProximaAcao
    ? new Date(caminho.prazoProximaAcao).toISOString().split('T')[0]
    : '';

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Editar Caminho do Cliente' : 'Novo Caminho do Cliente'}
        description={
          isEditing
            ? 'Atualize as informações do registro.'
            : 'Cadastre um novo cliente no fluxo de acompanhamento.'
        }
      >
        <Button variant="outline" onClick={handleCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </PageHeader>

      <div className="max-w-[1200px] mx-auto">
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <form onSubmit={salvar} className="grid gap-6">
              {/* Dados do cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Cliente *</Label>
                  <Input
                    value={caminho.clienteNome}
                    onChange={(e) => setCaminho((p) => ({ ...p, clienteNome: e.target.value }))}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    value={caminho.clienteCpf}
                    onChange={(e) =>
                      setCaminho((p) => ({ ...p, clienteCpf: formatarCpf(e.target.value) }))
                    }
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    maxLength={14}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Benefício</Label>
                  <Input
                    value={caminho.tipoBeneficio || ''}
                    onChange={(e) => setCaminho((p) => ({ ...p, tipoBeneficio: e.target.value }))}
                    placeholder="Ex: Aposentadoria por Idade"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nº Processo Administrativo</Label>
                  <Input
                    value={caminho.numeroProcessoAdm || ''}
                    onChange={(e) => setCaminho((p) => ({ ...p, numeroProcessoAdm: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nº Processo Judicial</Label>
                  <Input
                    value={caminho.numeroProcessoJud || ''}
                    onChange={(e) => setCaminho((p) => ({ ...p, numeroProcessoJud: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Responsável Atual</Label>
                  <Input
                    value={caminho.responsavelAtual || ''}
                    onChange={(e) => setCaminho((p) => ({ ...p, responsavelAtual: e.target.value }))}
                    placeholder="Nome do colaborador"
                  />
                </div>
              </div>

              {/* Etapa/Situação/Setor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Etapa Atual</Label>
                  <Select
                    value={caminho.etapaAtual}
                    onValueChange={(v: EtapaCaminho) => {
                      const meta = ETAPAS_CAMINHO.find((e) => e.key === v);
                      setCaminho((p) => ({
                        ...p,
                        etapaAtual: v,
                        setorResponsavel: meta ? meta.setorSugerido : p.setorResponsavel,
                        proximaAcao: meta ? meta.proximaAcaoSugerida : p.proximaAcao,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {ETAPAS_CAMINHO.map((e) => (
                        <SelectItem key={e.key} value={e.key}>
                          {e.ordem}. {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Situação</Label>
                  <Select
                    value={caminho.situacao}
                    onValueChange={(v: SituacaoCaminho) =>
                      setCaminho((p) => ({ ...p, situacao: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SITUACOES_CAMINHO.map((s) => (
                        <SelectItem key={s.key} value={s.key}>
                          {s.emoji} {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Setor Responsável</Label>
                  <Select
                    value={caminho.setorResponsavel}
                    onValueChange={(v: SetorResponsavel) =>
                      setCaminho((p) => ({ ...p, setorResponsavel: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SETORES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Próxima ação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Próxima Ação</Label>
                  <Input
                    value={caminho.proximaAcao || ''}
                    onChange={(e) => setCaminho((p) => ({ ...p, proximaAcao: e.target.value }))}
                    placeholder="Ex: Cobrar cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prazo da Próxima Ação</Label>
                  <Input
                    type="date"
                    value={prazoStr}
                    onChange={(e) =>
                      setCaminho((p) => ({
                        ...p,
                        prazoProximaAcao: e.target.value ? new Date(e.target.value) : null,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={caminho.observacoes || ''}
                  onChange={(e) => setCaminho((p) => ({ ...p, observacoes: e.target.value }))}
                  rows={4}
                  placeholder="Notas relevantes sobre este caminho..."
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovoCaminhoCliente;
