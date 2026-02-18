import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/view/components/ui/button";
import { Input } from "@/view/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/view/components/ui/card";
import { Alert, AlertDescription } from "@/view/components/ui/alert";
import { Label } from "@/view/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/view/components/ui/dialog";
import { AlertCircle } from 'lucide-react';
import { useLogin } from '@/viewmodel/useLoginViewModel';

const Login: React.FC = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    handleSubmit,
    handleResetPassword
  } = useLogin();

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const onResetPassword = async () => {
    const success = await handleResetPassword(resetEmail);
    if (success) {
      setResetSuccess(true);
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess(false);
        setResetEmail('');
        setError('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/images/logotipo.png" 
              alt="Logo" 
              className="h-24 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Escritório de Advocacia</CardTitle>
          <CardDescription>
            Dr. Phortus Leonardo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Button 
                  variant="link" 
                  className="px-0 font-normal text-xs text-muted-foreground"
                  type="button"
                  onClick={() => setShowResetModal(true)}
                >
                  Esqueci a senha
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <div>
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="text-primary hover:underline font-medium">
              Inscreva-se aqui
            </Link>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <DialogDescription>
              Informe seu email para receber um link de redefinição de senha.
            </DialogDescription>
          </DialogHeader>
          
          {resetSuccess ? (
             <Alert className="bg-green-50 text-green-900 border-green-200">
               <AlertDescription>
                 Email de redefinição enviado com sucesso! Verifique sua caixa de entrada.
               </AlertDescription>
             </Alert>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Digite seu email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetModal(false)}>
              Cancelar
            </Button>
            {!resetSuccess && (
              <Button onClick={onResetPassword} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Email'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;