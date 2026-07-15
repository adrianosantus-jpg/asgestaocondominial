"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  esqueciSenhaSchema,
  type EsqueciSenhaInput,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AuthCard } from "@/components/shared/auth-card";

export default function EsqueciSenhaPage() {
  const [enviado, setEnviado] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EsqueciSenhaInput>({
    resolver: zodResolver(esqueciSenhaSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: EsqueciSenhaInput) {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    // Sempre mostramos a mesma confirmação, exista ou não o e-mail — evita
    // vazar quais e-mails estão cadastrados no sistema.
    setEnviado(true);
  }

  if (enviado) {
    return (
      <AuthCard description="Verifique seu e-mail">
        <div className="flex flex-col items-center gap-3 text-center text-sm">
          <CheckCircle2 className="size-10 text-emerald-500" />
          <p>
            Se houver uma conta com esse e-mail, enviamos um link para
            redefinir a senha. Confira também a caixa de spam.
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
      description="Informe seu e-mail para receber o link de redefinição"
      footer={
        <Link href="/login" className="text-primary hover:underline">
          Voltar para o login
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
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

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="animate-spin" />}
            Enviar link
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
