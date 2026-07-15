"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  redefinirSenhaSchema,
  type RedefinirSenhaInput,
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

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RedefinirSenhaInput>({
    resolver: zodResolver(redefinirSenhaSchema),
    defaultValues: { password: "", confirmarSenha: "" },
  });

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setPronto(true);
    });

    // Caso o evento já tenha disparado antes deste componente montar.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPronto(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(values: RedefinirSenhaInput) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      setServerError("Não foi possível redefinir a senha. Tente novamente.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (!pronto) {
    return (
      <AuthCard description="Link inválido ou expirado">
        <p className="text-center text-sm text-muted-foreground">
          Abra o redefinir-senha a partir do link enviado por e-mail. Se o
          link expirou, solicite um novo em &quot;Esqueci minha senha&quot;.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard description="Defina sua nova senha">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Nova senha</FieldLabel>
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
            Salvar nova senha
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
