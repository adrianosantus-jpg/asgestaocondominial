"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cadastroSchema, type CadastroInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AuthCard } from "@/components/shared/auth-card";

export default function CadastroPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroInput>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { nome: "", email: "", password: "", confirmarSenha: "" },
  });

  async function onSubmit(values: CadastroInput) {
    setServerError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { nome: values.nome } },
    });

    if (error) {
      setServerError(
        error.message.includes("already registered") ||
          error.message.includes("already exists")
          ? "Este e-mail já está cadastrado."
          : "Não foi possível criar a conta. Tente novamente."
      );
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setAguardandoConfirmacao(true);
  }

  if (aguardandoConfirmacao) {
    return (
      <AuthCard description="Confirme seu e-mail para continuar">
        <div className="flex flex-col items-center gap-3 text-center text-sm">
          <CheckCircle2 className="size-10 text-emerald-500" />
          <p>
            Enviamos um link de confirmação para o seu e-mail. Clique nele
            para ativar sua conta e depois faça login normalmente.
          </p>
          <Link href="/login" className="text-primary hover:underline">
            Voltar para o login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      description="Crie sua conta para começar"
      footer={
        <span>
          Já tem conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field data-invalid={!!errors.nome}>
            <FieldLabel htmlFor="nome">Nome</FieldLabel>
            <Input id="nome" autoComplete="name" placeholder="Seu nome" {...register("nome")} />
            <FieldError errors={[errors.nome]} />
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Field data-invalid={!!errors.confirmarSenha}>
            <FieldLabel htmlFor="confirmarSenha">Confirmar senha</FieldLabel>
            <Input
              id="confirmarSenha"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("confirmarSenha")}
            />
            <FieldError errors={[errors.confirmarSenha]} />
          </Field>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="animate-spin" />}
            Criar conta
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
