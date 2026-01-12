import React from 'react';
import { User, MapPin, Phone, Heart, Users, Briefcase, Star, Save, Loader2,AlertCircle,CheckCircle2} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFormulario } from '@/hooks/useFormulario';
import { cn } from '@/lib/utils';

const Formulario: React.FC = () => {
  const {
    formData,
    loading,
    error,
    success,
    validationErrors,
    atualizarCampo,
    salvarFormulario
  } = useFormulario();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await salvarFormulario();
  };

  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName];
  };

  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <p className="text-sm text-destructive mt-1">{error}</p>;
  };

  if (loading && !formData.primeiroNome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>Carregando formulário...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Formulário de Cadastro</h1>
          <p className="text-muted-foreground mt-1">Preencha seus dados completos abaixo.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Sucesso!</AlertTitle>
            <AlertDescription>Dados salvos com sucesso.</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais */}
          <Card className="shadow-sm border-0 shadow-card">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primeiroNome">Primeiro Nome</Label>
                <Input
                  id="primeiroNome"
                  value={formData.primeiroNome}
                  onChange={(e) => atualizarCampo('primeiroNome', e.target.value)}
                  className={cn(getFieldError('primeiroNome') && "border-destructive")}
                />
                <ErrorMessage error={getFieldError('primeiroNome')} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sobreNome">Sobrenome</Label>
                <Input
                  id="sobreNome"
                  value={formData.sobreNome}
                  onChange={(e) => atualizarCampo('sobreNome', e.target.value)}
                  className={cn(getFieldError('sobreNome') && "border-destructive")}
                />
                <ErrorMessage error={getFieldError('sobreNome')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => atualizarCampo('dataNascimento', e.target.value)}
                  className={cn(getFieldError('dataNascimento') && "border-destructive")}
                />
                <ErrorMessage error={getFieldError('dataNascimento')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => atualizarCampo('cpf', e.target.value)}
                  className={cn(getFieldError('cpf') && "border-destructive")}
                />
                <ErrorMessage error={getFieldError('cpf')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => atualizarCampo('rg', e.target.value)}
                  className={cn(getFieldError('rg') && "border-destructive")}
                />
                <ErrorMessage error={getFieldError('rg')} />
              </div>
            </CardContent>
          </Card>

          {/* Endereço Residencial */}
          <Card className="shadow-sm border-0 shadow-card">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Endereço Residencial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  value={formData.rua}
                  onChange={(e) => atualizarCampo('rua', e.target.value)}
                  className={cn(getFieldError('rua') && "border-destructive")}
                />
                <ErrorMessage error={getFieldError('rua')} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => atualizarCampo('numero', e.target.value)}
                    className={cn(getFieldError('numero') && "border-destructive")}
                  />
                  <ErrorMessage error={getFieldError('numero')} />
                </div>
                
                <div className="md:col-span-5 space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => atualizarCampo('bairro', e.target.value)}
                    className={cn(getFieldError('bairro') && "border-destructive")}
                  />
                  <ErrorMessage error={getFieldError('bairro')} />
                </div>

                <div className="md:col-span-4 space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => atualizarCampo('cidade', e.target.value)}
                    className={cn(getFieldError('cidade') && "border-destructive")}
                  />
                  <ErrorMessage error={getFieldError('cidade')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => atualizarCampo('cep', e.target.value)}
                    className={cn(getFieldError('cep') && "border-destructive")}
                  />
                  <ErrorMessage error={getFieldError('cep')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contatos */}
          <Card className="shadow-sm border-0 shadow-card">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Phone className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Contatos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefonePessoal">Telefone Pessoal</Label>
                  <Input
                    id="telefonePessoal"
                    type="tel"
                    value={formData.telefonePessoal}
                    onChange={(e) => atualizarCampo('telefonePessoal', e.target.value)}
                    className={cn(getFieldError('telefonePessoal') && "border-destructive")}
                  />
                  <ErrorMessage error={getFieldError('telefonePessoal')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailPessoal">E-mail Pessoal</Label>
                  <Input
                    id="emailPessoal"
                    type="email"
                    value={formData.emailPessoal}
                    onChange={(e) => atualizarCampo('emailPessoal', e.target.value)}
                    className={cn(getFieldError('emailPessoal') && "border-destructive")}
                  />
                  <ErrorMessage error={getFieldError('emailPessoal')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeContatoEmergencia">Nome do Contato de Emergência</Label>
                <Input
                  id="nomeContatoEmergencia"
                  value={formData.nomeContatoEmergencia}
                  onChange={(e) => atualizarCampo('nomeContatoEmergencia', e.target.value)}
                  className={cn(getFieldError('nomeContatoEmergencia') && "border-destructive")}
                />
                <ErrorMessage error={getFieldError('nomeContatoEmergencia')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relacaoContatoEmergencia">Relação com o Colaborador</Label>
                <Input
                  id="relacaoContatoEmergencia"
                  value={formData.relacaoContatoEmergencia}
                  onChange={(e) => atualizarCampo('relacaoContatoEmergencia', e.target.value)}
                  className={cn(getFieldError('relacaoContatoEmergencia') && "border-destructive")}
                />
                <ErrorMessage error={getFieldError('relacaoContatoEmergencia')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefoneEmergencia">Telefone de Emergência</Label>
                <Input
                  id="telefoneEmergencia"
                  type="tel"
                  value={formData.telefoneEmergencia}
                  onChange={(e) => atualizarCampo('telefoneEmergencia', e.target.value)}
                  className={cn(getFieldError('telefoneEmergencia') && "border-destructive")}
                />
                <ErrorMessage error={getFieldError('telefoneEmergencia')} />
              </div>
            </CardContent>
          </Card>

          {/* Informações de Saúde */}
          <Card className="shadow-sm border-0 shadow-card">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Heart className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Informações de Saúde</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipoSanguineo">Tipo Sanguíneo</Label>
                <Input
                  id="tipoSanguineo"
                  value={formData.tipoSanguineo}
                  onChange={(e) => atualizarCampo('tipoSanguineo', e.target.value)}
                  className={cn(getFieldError('tipoSanguineo') && "border-destructive")}
                />
                <ErrorMessage error={getFieldError('tipoSanguineo')} />
              </div>

              <div className="space-y-2">
                <Label>Possui Alergias?</Label>
                <RadioGroup 
                  value={formData.alergias} 
                  onValueChange={(value) => atualizarCampo('alergias', value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="alergia-sim" />
                    <Label htmlFor="alergia-sim" className="font-normal cursor-pointer">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="alergia-nao" />
                    <Label htmlFor="alergia-nao" className="font-normal cursor-pointer">Não</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.alergias === 'Sim' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="quaisAlergias">Se sim, quais?</Label>
                  <Input
                    id="quaisAlergias"
                    value={formData.quaisAlergias || ''}
                    onChange={(e) => atualizarCampo('quaisAlergias', e.target.value)}
                    className={cn(getFieldError('quaisAlergias') && "border-destructive")}
                  />
                  <ErrorMessage error={getFieldError('quaisAlergias')} />
                </div>
              )}

              <div className="space-y-2">
                <Label>Possui Alguma Doença Crônica?</Label>
                <RadioGroup 
                  value={formData.doencaCronica} 
                  onValueChange={(value) => atualizarCampo('doencaCronica', value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="doenca-sim" />
                    <Label htmlFor="doenca-sim" className="font-normal cursor-pointer">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="doenca-nao" />
                    <Label htmlFor="doenca-nao" className="font-normal cursor-pointer">Não</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.doencaCronica === 'Sim' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="quaisDoencas">Se sim, quais?</Label>
                  <Input
                    id="quaisDoencas"
                    value={formData.quaisDoencas || ''}
                    onChange={(e) => atualizarCampo('quaisDoencas', e.target.value)}
                    className={cn(getFieldError('quaisDoencas') && "border-destructive")}
                  />
                  <ErrorMessage error={getFieldError('quaisDoencas')} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações Familiares */}
          <Card className="shadow-sm border-0 shadow-card">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Informações Familiares</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tem filhos?</Label>
                <RadioGroup 
                  value={formData.temFilhos} 
                  onValueChange={(value) => atualizarCampo('temFilhos', value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="filhos-sim" />
                    <Label htmlFor="filhos-sim" className="font-normal cursor-pointer">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="filhos-nao" />
                    <Label htmlFor="filhos-nao" className="font-normal cursor-pointer">Não</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.temFilhos === 'Sim' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="nomeIdadeFilhos">Nome e Idade dos Filhos</Label>
                  <Input
                    id="nomeIdadeFilhos"
                    value={formData.nomeIdadeFilhos || ''}
                    onChange={(e) => atualizarCampo('nomeIdadeFilhos', e.target.value)}
                    className={cn(getFieldError('nomeIdadeFilhos') && "border-destructive")}
                  />
                  <ErrorMessage error={getFieldError('nomeIdadeFilhos')} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="estadoCivil">Estado Civil</Label>
                <Select
                  value={formData.estadoCivil}
                  onValueChange={(value) => atualizarCampo('estadoCivil', value)}
                >
                  <SelectTrigger className={cn(getFieldError('estadoCivil') && "border-destructive")}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                    <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                    <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                    <SelectItem value="União Estável">União Estável</SelectItem>
                    <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage error={getFieldError('estadoCivil')} />
              </div>
            </CardContent>
          </Card>

          {/* Outros Dados */}
          <Card className="shadow-sm border-0 shadow-card">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Outros Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numeroOAB">Número de Registro na OAB (se aplicável)</Label>
                <Input
                  id="numeroOAB"
                  value={formData.numeroOAB || ''}
                  onChange={(e) => atualizarCampo('numeroOAB', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="funcaoCargo">Função/Cargo</Label>
                  <Input
                    id="funcaoCargo"
                    value={formData.funcaoCargo}
                    onChange={(e) => atualizarCampo('funcaoCargo', e.target.value)}
                    className={cn(getFieldError('funcaoCargo') && "border-destructive")}
                  />
                  <ErrorMessage error={getFieldError('funcaoCargo')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento/Setor</Label>
                  <Input
                    id="departamento"
                    value={formData.departamento}
                    onChange={(e) => atualizarCampo('departamento', e.target.value)}
                    className={cn(getFieldError('departamento') && "border-destructive")}
                  />
                  <ErrorMessage error={getFieldError('departamento')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataIngresso">Data de Ingresso na Empresa</Label>
                <Input
                  id="dataIngresso"
                  type="date"
                  value={formData.dataIngresso}
                  onChange={(e) => atualizarCampo('dataIngresso', e.target.value)}
                  className={cn(getFieldError('dataIngresso') && "border-destructive")}
                />
                <ErrorMessage error={getFieldError('dataIngresso')} />
              </div>
            </CardContent>
          </Card>

          {/* Preferências Pessoais */}
          <Card className="shadow-sm border-0 shadow-card">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Star className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Preferências Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hobbies">Tem algum hobby ou interesse pessoal?</Label>
                <Input
                  id="hobbies"
                  value={formData.hobbies || ''}
                  onChange={(e) => atualizarCampo('hobbies', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Possui alguma restrição alimentar?</Label>
                <RadioGroup 
                  value={formData.restricaoAlimentar} 
                  onValueChange={(value) => atualizarCampo('restricaoAlimentar', value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="restricao-sim" />
                    <Label htmlFor="restricao-sim" className="font-normal cursor-pointer">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="restricao-nao" />
                    <Label htmlFor="restricao-nao" className="font-normal cursor-pointer">Não</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.restricaoAlimentar === 'Sim' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="qualRestricao">Se sim, qual?</Label>
                  <Input
                    id="qualRestricao"
                    value={formData.qualRestricao || ''}
                    onChange={(e) => atualizarCampo('qualRestricao', e.target.value)}
                    className={cn(getFieldError('qualRestricao') && "border-destructive")}
                  />
                  <ErrorMessage error={getFieldError('qualRestricao')} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="observacoesAdicionais">Observações Adicionais</Label>
                <Textarea
                  id="observacoesAdicionais"
                  rows={3}
                  value={formData.observacoesAdicionais || ''}
                  onChange={(e) => atualizarCampo('observacoesAdicionais', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4 pb-8">
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto px-8 gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Cadastro
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Formulario;
