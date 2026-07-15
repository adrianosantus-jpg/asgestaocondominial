"use client";

import { toast } from "sonner";
import { useProfile } from "@/lib/hooks/use-profile";
import {
  useProfiles,
  useToggleProfileAtivo,
  useUpdateProfileRole,
  type ProfileRow,
} from "@/lib/hooks/use-profiles";
import { ROLE_LABELS, ROLE_OPTIONS } from "@/lib/constants/roles";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function initialsOf(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function ConfiguracoesPage() {
  const { data: meuPerfil } = useProfile();
  const { data: usuarios, isLoading } = useProfiles();
  const updateRole = useUpdateProfileRole();
  const toggleAtivo = useToggleProfileAtivo();

  const souAdmin = meuPerfil?.role === "admin";

  return (
    <div className="space-y-4">
      <PageHeader
        title="Configurações"
        description="Usuários e perfis de acesso do condomínio."
      />

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios?.map((u) => (
                    <UsuarioRow
                      key={u.id}
                      usuario={u}
                      editavel={souAdmin && u.id !== meuPerfil?.id}
                      onChangeRole={(role) =>
                        updateRole.mutate(
                          { id: u.id, role },
                          {
                            onSuccess: () => toast.success("Perfil atualizado"),
                            onError: () => toast.error("Erro ao atualizar perfil"),
                          }
                        )
                      }
                      onToggleAtivo={(ativo) =>
                        toggleAtivo.mutate(
                          { id: u.id, ativo },
                          {
                            onSuccess: () =>
                              toast.success(ativo ? "Usuário ativado" : "Usuário desativado"),
                            onError: () => toast.error("Erro ao atualizar status"),
                          }
                        )
                      }
                    />
                  ))}
                  {usuarios?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {!souAdmin && (
            <p className="mt-3 text-xs text-muted-foreground">
              Somente administradores podem alterar perfis e status de usuários.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UsuarioRow({
  usuario,
  editavel,
  onChangeRole,
  onToggleAtivo,
}: {
  usuario: ProfileRow;
  editavel: boolean;
  onChangeRole: (role: ProfileRow["role"]) => void;
  onToggleAtivo: (ativo: boolean) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">
              {initialsOf(usuario.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium">{usuario.nome}</div>
            <div className="truncate text-xs text-muted-foreground">
              {usuario.email}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {editavel ? (
          <Select
            items={Object.fromEntries(
              ROLE_OPTIONS.map((r) => [r, ROLE_LABELS[r]])
            )}
            value={usuario.role}
            onValueChange={(v) => v && onChangeRole(v as ProfileRow["role"])}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline">{ROLE_LABELS[usuario.role]}</Badge>
        )}
      </TableCell>
      <TableCell>
        {editavel ? (
          <div className="flex items-center gap-2">
            <Switch checked={usuario.ativo} onCheckedChange={onToggleAtivo} />
            <span className="text-sm text-muted-foreground">
              {usuario.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
        ) : (
          <Badge variant={usuario.ativo ? "outline" : "destructive"}>
            {usuario.ativo ? "Ativo" : "Inativo"}
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}
