"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, Mail, ArrowRight, Clock, Building2, Copy, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface OrderSuccessPageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const [orderId, setOrderId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();

  // Get payment type from URL params
  const paymentType = searchParams.get("payment");
  const isBankTransfer = paymentType === "bank_transfer";
  const isPendingPayment = searchParams.get("status") === "pending";

  useEffect(() => {
    params.then(({ orderId }) => setOrderId(orderId));
  }, [params]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Skopiowano do schowka");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nie udało się skopiować");
    }
  };

  // Mock bank transfer details - in production, these would come from backend
  const bankTransferDetails = {
    bankName: "Bank XYZ",
    accountNumber: "PL12 3456 7890 1234 5678 9012 3456",
    recipientName: "DoSwiftly Sp. z o.o.",
    transferTitle: `Zamówienie ${orderId}`,
    amount: "---", // Would be fetched from order
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className={`rounded-full p-4 ${isPendingPayment ? "bg-yellow-100" : "bg-green-100"}`}>
            {isPendingPayment ? (
              <Clock className="h-12 w-12 text-yellow-600" />
            ) : (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-2 text-3xl font-bold">
          {isPendingPayment ? "Zamówienie oczekuje na płatność" : "Dziękujemy za zamówienie!"}
        </h1>
        <p className="mb-8 text-muted-foreground">
          {isPendingPayment
            ? "Po otrzymaniu płatności rozpoczniemy realizację zamówienia."
            : "Twoje zamówienie zostało potwierdzone i wkrótce zostanie wysłane."}
        </p>

        {/* Order Number */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Potwierdzenie zamówienia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-muted-foreground">Numer zamówienia</span>
                <span className="font-mono font-medium">{orderId || "..."}</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium">Email potwierdzający</p>
                    <p className="text-sm text-muted-foreground">
                      Wysłaliśmy potwierdzenie ze szczegółami zamówienia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium">Śledzenie przesyłki</p>
                    <p className="text-sm text-muted-foreground">
                      Otrzymasz numer śledzenia, gdy paczka zostanie wysłana.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Transfer Instructions */}
        {isBankTransfer && (
          <Alert className="mb-8 text-left">
            <Building2 className="h-4 w-4" />
            <AlertTitle>Dane do przelewu bankowego</AlertTitle>
            <AlertDescription className="mt-4 space-y-3">
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bank</span>
                  <span className="font-medium">{bankTransferDetails.bankName}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Numer konta</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{bankTransferDetails.accountNumber}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(bankTransferDetails.accountNumber)}
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Odbiorca</span>
                  <span className="font-medium">{bankTransferDetails.recipientName}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Tytuł przelewu</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{bankTransferDetails.transferTitle}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(bankTransferDetails.transferTitle)}
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Realizacja zamówienia rozpocznie się po zaksięgowaniu wpłaty (zazwyczaj 1-2 dni robocze).
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* What's Next */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Co dalej?</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-left">
              {isBankTransfer ? (
                <>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      1
                    </span>
                    <div>
                      <p className="font-medium">Wykonaj przelew</p>
                      <p className="text-sm text-muted-foreground">
                        Prześlij płatność na podane powyżej konto bankowe.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      2
                    </span>
                    <div>
                      <p className="font-medium">Potwierdzenie płatności</p>
                      <p className="text-sm text-muted-foreground">
                        Po zaksięgowaniu wpłaty otrzymasz email z potwierdzeniem.
                      </p>
                    </div>
                  </li>
                </>
              ) : (
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Przetwarzanie zamówienia</p>
                    <p className="text-sm text-muted-foreground">
                      Przygotowujemy Twoje zamówienie do wysyłki.
                    </p>
                  </div>
                </li>
              )}
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {isBankTransfer ? 3 : 2}
                </span>
                <div>
                  <p className="font-medium">Wysyłka</p>
                  <p className="text-sm text-muted-foreground">
                    Po wysłaniu otrzymasz email z numerem śledzenia przesyłki.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {isBankTransfer ? 4 : 3}
                </span>
                <div>
                  <p className="font-medium">Dostawa</p>
                  <p className="text-sm text-muted-foreground">
                    Paczka zostanie dostarczona pod wskazany adres.
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/products">
              Kontynuuj zakupy
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account/orders">Moje zamówienia</Link>
          </Button>
        </div>

        {/* Help */}
        <p className="mt-8 text-sm text-muted-foreground">
          Potrzebujesz pomocy?{" "}
          <Link href="/contact" className="text-primary underline underline-offset-4">
            Skontaktuj się z nami
          </Link>
        </p>
      </div>
    </div>
  );
}
