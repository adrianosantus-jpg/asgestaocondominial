import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function AuthCard({
  description,
  children,
  footer,
}: {
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Image
            src="/logo.jpg"
            alt="AS Gestão Condominial"
            width={72}
            height={72}
            className="size-18 rounded-xl object-cover"
            priority
          />
          <div>
            <h1 className="text-lg font-semibold">AS Gestão Condominial</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && (
          <CardFooter className="justify-center text-sm text-muted-foreground">
            {footer}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
