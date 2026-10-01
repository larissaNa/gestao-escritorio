import React from 'react';
import { ArrowLeft, Loader2, Save, Calendar, UserCheck } from 'lucide-react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Textarea } from '@/view/components/ui/textarea';
import { Label } from '@/view/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/view/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/view/components/ui/alert';
import { useNovoRelatorioDiario } from '@/viewmodel/relatorios/useNovoRelatorioDiarioViewModel';

const NovoRelatorioDiario: React.FC = () => {
  const {
    formData,
    setFormData,
    loading,
    error,
    isEditing,
    responsavelDisplay,
    handleSubmit,
    handleCancel,
  } = useNovoRelatorioDiario();

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Editar Relatório Diário' : 'Novo Relatório Diário'}
        description={
          isEditing
            ? 'Atualize o registro de atividades do diário de bordo.'
            : 'Preencha suas atividades diárias no diário de bordo.'
        }
      >
        <Button variant="outline" onClick={handleCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </PageHeader>

      <div className="max-w-3xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Diário de Bordo do Estagiário</CardTitle>
            <CardDescription>
              Registre as tarefas, pesquisas, minutas ou atendimentos realizados no dia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Responsável (preenchimento automático pelo login) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  Responsável
                </Label>
                <Input
                  value={responsavelDisplay}
                  disabled
                  className="bg-muted font-medium text-foreground cursor-not-allowed"
                />
                <span className="text-xs text-muted-foreground">
                  Identificado automaticamente pelo usuário autenticado.
                </span>
              </div>

              {/* Data da Atividade */}
              <div className="space-y-2">
                <Label htmlFor="data" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Data da Atividade *
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData((prev) => ({ ...prev, data: e.target.value }))}
                  required
                />
              </div>

              {/* Descrição Textual */}
              <div className="space-y-2">
                <Label htmlFor="descricao">
                  Descrição das Atividades Realizadas *
                </Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva detalhadamente as atividades executadas no dia (ex: elaboração de peças, protocolo no eproc/PJe, pesquisas jurisprudenciais, atendimento a clientes, idas ao fórum, etc.)..."
                  className="min-h-[220px] resize-y text-base"
                  required
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Você pode usar quebras de linha e tópicos para organizar seu texto.</span>
                  <span>{formData.descricao.length} caracteres</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Registro
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovoRelatorioDiario;
