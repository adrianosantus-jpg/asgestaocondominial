"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { ProdutoRow } from "@/lib/hooks/use-produtos";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export function QrCodeDialog({
  open,
  onOpenChange,
  produto,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: ProdutoRow;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDataUrl(null);
    QRCode.toDataURL(produto.id, { width: 256, margin: 1 }).then(setDataUrl);
  }, [open, produto.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>QR Code do produto</DialogTitle>
          <DialogDescription>
            {produto.codigo} — {produto.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt={`QR code de ${produto.nome}`} className="rounded-lg" />
          ) : (
            <Skeleton className="size-64" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
