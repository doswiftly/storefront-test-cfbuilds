"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { useCartSync } from "@/hooks/use-cart-sync";
import {
  useCheckoutCreate,
  useCheckoutEmailUpdate,
  useCheckoutShippingAddressUpdate,
  useCheckoutBillingAddressUpdate,
  useCheckoutShippingLineUpdate,
  useCheckoutDiscountCodeApply,
  useCheckoutDiscountCodeRemove,
  useCheckoutGiftCardApply,
  useCheckoutGiftCardRemove,
  useCheckoutComplete,
  useCheckout,
} from "@/lib/graphql/hooks";
import { formatAmount } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PaymentStep } from "@/components/checkout/payment-step";
import type { PaymentMethod } from "@/components/checkout/payment-method-card";
import { toast } from "sonner";
import { z } from "zod";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  Package,
  Truck,
  CreditCard,
  ClipboardCheck,
  Tag,
  X,
  User,
  ShoppingBag,
  Gift,
} from "lucide-react";

// ============================================================================
// CONSTANTS
// ============================================================================

const COUNTRIES = [
  { code: "PL", name: "Polska" },
  { code: "DE", name: "Niemcy" },
  { code: "CZ", name: "Czechy" },
  { code: "SK", name: "Słowacja" },
  { code: "AT", name: "Austria" },
  { code: "FR", name: "Francja" },
  { code: "NL", name: "Holandia" },
  { code: "BE", name: "Belgia" },
  { code: "IT", name: "Włochy" },
  { code: "ES", name: "Hiszpania" },
  { code: "GB", name: "Wielka Brytania" },
  { code: "US", name: "Stany Zjednoczone" },
];

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const contactSchema = z.object({
  email: z.string().email("Podaj prawidłowy adres email"),
  phone: z
    .string()
    .min(9, "Numer telefonu jest wymagany")
    .regex(/^\+?[0-9\s\-]{9,15}$/, "Nieprawidłowy format numeru telefonu"),
});

const addressSchema = z.object({
  firstName: z.string().min(1, "Imię jest wymagane"),
  lastName: z.string().min(1, "Nazwisko jest wymagane"),
  address1: z.string().min(1, "Adres jest wymagany"),
  address2: z.string().optional(),
  city: z.string().min(1, "Miasto jest wymagane"),
  province: z.string().optional(),
  zip: z.string().min(1, "Kod pocztowy jest wymagany"),
  country: z.string().min(2, "Kraj jest wymagany"),
  phone: z.string().optional(),
  company: z.string().optional(),
});

// ============================================================================
// TYPES
// ============================================================================

type CheckoutStep = "contact" | "shipping" | "delivery" | "payment" | "review";

interface ShippingRate {
  handle: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
}

interface AddressForm {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone: string;
  company: string;
}

interface CheckoutFormState {
  email: string;
  phone: string;
  shippingAddress: AddressForm;
  billingAddress: AddressForm;
  sameAsBilling: boolean;
  selectedShippingRate: string | null;
  selectedPaymentMethodId: string | null;
  discountCode: string;
  appliedDiscountCode: string | null;
  giftCardCode: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
}

const emptyAddress: AddressForm = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  province: "",
  zip: "",
  country: "PL",
  phone: "",
  company: "",
};

// ============================================================================
// ADDRESS FORM FIELDS COMPONENT (extracted to prevent re-mount on state change)
// ============================================================================

interface AddressFormFieldsProps {
  prefix: "shipping" | "billing";
  values: AddressForm;
  onChange: (field: keyof AddressForm, value: string) => void;
  errors: Record<string, string>;
}

function AddressFormFields({ prefix, values, onChange, errors }: AddressFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${prefix}_firstName`}>Imię *</Label>
          <Input
            id={`${prefix}_firstName`}
            value={values.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            className={errors[`${prefix}_firstName`] ? "border-destructive" : ""}
          />
          {errors[`${prefix}_firstName`] && (
            <p className="mt-1 text-sm text-destructive">{errors[`${prefix}_firstName`]}</p>
          )}
        </div>
        <div>
          <Label htmlFor={`${prefix}_lastName`}>Nazwisko *</Label>
          <Input
            id={`${prefix}_lastName`}
            value={values.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            className={errors[`${prefix}_lastName`] ? "border-destructive" : ""}
          />
          {errors[`${prefix}_lastName`] && (
            <p className="mt-1 text-sm text-destructive">{errors[`${prefix}_lastName`]}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor={`${prefix}_company`}>Firma (opcjonalnie)</Label>
        <Input
          id={`${prefix}_company`}
          value={values.company}
          onChange={(e) => onChange("company", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor={`${prefix}_address1`}>Adres *</Label>
        <Input
          id={`${prefix}_address1`}
          placeholder="Ulica i numer"
          value={values.address1}
          onChange={(e) => onChange("address1", e.target.value)}
          className={errors[`${prefix}_address1`] ? "border-destructive" : ""}
        />
        {errors[`${prefix}_address1`] && (
          <p className="mt-1 text-sm text-destructive">{errors[`${prefix}_address1`]}</p>
        )}
      </div>

      <div>
        <Label htmlFor={`${prefix}_address2`}>Mieszkanie, piętro (opcjonalnie)</Label>
        <Input
          id={`${prefix}_address2`}
          value={values.address2}
          onChange={(e) => onChange("address2", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${prefix}_zip`}>Kod pocztowy *</Label>
          <Input
            id={`${prefix}_zip`}
            placeholder="00-000"
            value={values.zip}
            onChange={(e) => onChange("zip", e.target.value)}
            className={errors[`${prefix}_zip`] ? "border-destructive" : ""}
          />
          {errors[`${prefix}_zip`] && (
            <p className="mt-1 text-sm text-destructive">{errors[`${prefix}_zip`]}</p>
          )}
        </div>
        <div>
          <Label htmlFor={`${prefix}_city`}>Miasto *</Label>
          <Input
            id={`${prefix}_city`}
            value={values.city}
            onChange={(e) => onChange("city", e.target.value)}
            className={errors[`${prefix}_city`] ? "border-destructive" : ""}
          />
          {errors[`${prefix}_city`] && (
            <p className="mt-1 text-sm text-destructive">{errors[`${prefix}_city`]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${prefix}_country`}>Kraj *</Label>
          <Select value={values.country} onValueChange={(value) => onChange("country", value)}>
            <SelectTrigger className={errors[`${prefix}_country`] ? "border-destructive" : ""}>
              <SelectValue placeholder="Wybierz kraj" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors[`${prefix}_country`] && (
            <p className="mt-1 text-sm text-destructive">{errors[`${prefix}_country`]}</p>
          )}
        </div>
        <div>
          <Label htmlFor={`${prefix}_province`}>Województwo (opcjonalnie)</Label>
          <Input
            id={`${prefix}_province`}
            value={values.province}
            onChange={(e) => onChange("province", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CHECKOUT PAGE
// ============================================================================

export default function CheckoutPage() {
  const router = useRouter();
  const { cartId, clearCart } = useCartStore();
  const { items, isLoading: isCartLoading } = useCartSync();

  // Step management
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("contact");
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  // Detect if all items are gift cards (skip shipping)
  const allGiftCards = items.length > 0 && items.every((item) => item.productType === "GIFT_CARD");
  const hasGiftCards = items.some((item) => item.productType === "GIFT_CARD");

  // Gift card recipient state
  const [giftCardRecipients, setGiftCardRecipients] = useState<
    Record<string, { recipientEmail?: string; recipientName?: string; message?: string }>
  >({});

  // Form state
  const [formState, setFormState] = useState<CheckoutFormState>({
    email: "",
    phone: "",
    shippingAddress: { ...emptyAddress },
    billingAddress: { ...emptyAddress },
    sameAsBilling: true,
    selectedShippingRate: null,
    selectedPaymentMethodId: null,
    discountCode: "",
    appliedDiscountCode: null,
    giftCardCode: "",
    acceptTerms: false,
    acceptMarketing: false,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutations
  const createCheckout = useCheckoutCreate();
  const updateEmail = useCheckoutEmailUpdate();
  const updateShippingAddress = useCheckoutShippingAddressUpdate();
  const updateBillingAddress = useCheckoutBillingAddressUpdate();
  const updateShippingLine = useCheckoutShippingLineUpdate();
  const applyDiscount = useCheckoutDiscountCodeApply();
  const removeDiscount = useCheckoutDiscountCodeRemove();
  const applyGiftCard = useCheckoutGiftCardApply();
  const removeGiftCard = useCheckoutGiftCardRemove();
  const completeCheckout = useCheckoutComplete();

  // Query checkout for shipping rates
  const { data: checkoutData, refetch: refetchCheckout } = useCheckout(checkoutId);
  const checkout = checkoutData?.checkout;

  // Sync discount codes from checkout (transferred from cart) to form state
  useEffect(() => {
    if (checkout?.discountCodes?.length > 0 && !formState.appliedDiscountCode) {
      const applicableCode = checkout.discountCodes.find((dc: any) => dc.applicable);
      if (applicableCode) {
        setFormState((prev) => ({
          ...prev,
          appliedDiscountCode: applicableCode.code,
        }));
      }
    }
  }, [checkout?.discountCodes]);

  // Loading state
  const isLoading =
    createCheckout.isPending ||
    updateEmail.isPending ||
    updateShippingAddress.isPending ||
    updateBillingAddress.isPending ||
    updateShippingLine.isPending ||
    applyDiscount.isPending ||
    removeDiscount.isPending ||
    applyGiftCard.isPending ||
    removeGiftCard.isPending ||
    completeCheckout.isPending;

  // Calculate totals from checkout or cart
  const currencyCode = checkout?.currencyCode || items[0]?.price.currencyCode || "PLN";

  // Use centralized formatPrice with proper locale based on currency
  const formatPrice = (amount: string | number) => formatAmount(amount, currencyCode);

  // ============================================================================
  // STEP 1: Create checkout and update contact info
  // ============================================================================

  const handleContactSubmit = async () => {
    // Validate contact info
    const result = contactSchema.safeParse({
      email: formState.email,
      phone: formState.phone,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    try {
      // Create checkout if not exists
      if (!checkoutId) {
        const createResult = await createCheckout.mutateAsync({
          input: {
            cartId,
            email: formState.email,
          },
        });

        if (createResult.checkoutCreate.userErrors?.length > 0) {
          toast.error(createResult.checkoutCreate.userErrors[0].message);
          return;
        }

        if (createResult.checkoutCreate.checkout) {
          setCheckoutId(createResult.checkoutCreate.checkout.id);
        }
      } else {
        // Update email on existing checkout
        const emailResult = await updateEmail.mutateAsync({
          checkoutId,
          email: formState.email,
        });

        if (emailResult.checkoutEmailUpdate.userErrors?.length > 0) {
          toast.error(emailResult.checkoutEmailUpdate.userErrors[0].message);
          return;
        }
      }

      setCurrentStep(allGiftCards ? "payment" : "shipping");
    } catch (error: any) {
      toast.error(error.message || "Nie udało się przetworzyć danych kontaktowych");
    }
  };

  // ============================================================================
  // STEP 2: Update shipping address
  // ============================================================================

  const handleShippingSubmit = async () => {
    // Validate address
    const result = addressSchema.safeParse(formState.shippingAddress);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[`shipping_${err.path[0]}`] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Validate billing address if different
    if (!formState.sameAsBilling) {
      const billingResult = addressSchema.safeParse(formState.billingAddress);
      if (!billingResult.success) {
        const fieldErrors: Record<string, string> = {};
        billingResult.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[`billing_${err.path[0]}`] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setErrors({});

    if (!checkoutId) {
      toast.error("Checkout nie znaleziony. Wróć i spróbuj ponownie.");
      return;
    }

    try {
      // Update shipping address
      const addressResult = await updateShippingAddress.mutateAsync({
        checkoutId,
        shippingAddress: {
          ...formState.shippingAddress,
          phone: formState.phone,
        },
      });

      if (addressResult.checkoutShippingAddressUpdate.userErrors?.length > 0) {
        toast.error(addressResult.checkoutShippingAddressUpdate.userErrors[0].message);
        return;
      }

      // Update billing address
      const billingToUse = formState.sameAsBilling
        ? formState.shippingAddress
        : formState.billingAddress;

      const billingResult = await updateBillingAddress.mutateAsync({
        checkoutId,
        billingAddress: {
          ...billingToUse,
          phone: formState.phone,
        },
      });

      if (billingResult.checkoutBillingAddressUpdate.userErrors?.length > 0) {
        toast.error(billingResult.checkoutBillingAddressUpdate.userErrors[0].message);
        return;
      }

      // Refetch checkout to get shipping rates
      await refetchCheckout();
      setCurrentStep("delivery");
    } catch (error: any) {
      toast.error(error.message || "Nie udało się zaktualizować adresu");
    }
  };

  // ============================================================================
  // STEP 3: Select shipping method
  // ============================================================================

  const handleDeliverySubmit = async () => {
    if (!formState.selectedShippingRate) {
      setErrors({ shipping: "Wybierz metodę dostawy" });
      return;
    }
    setErrors({});

    if (!checkoutId) {
      toast.error("Checkout nie znaleziony. Wróć i spróbuj ponownie.");
      return;
    }

    try {
      const shippingResult = await updateShippingLine.mutateAsync({
        checkoutId,
        shippingRateHandle: formState.selectedShippingRate,
      });

      if (shippingResult.checkoutShippingLineUpdate.userErrors?.length > 0) {
        toast.error(shippingResult.checkoutShippingLineUpdate.userErrors[0].message);
        return;
      }

      await refetchCheckout();
      setCurrentStep("payment");
    } catch (error: any) {
      toast.error(error.message || "Nie udało się wybrać metody dostawy");
    }
  };

  // ============================================================================
  // STEP 4: Select payment method
  // ============================================================================

  const handlePaymentMethodSelect = (paymentMethodId: string) => {
    // Validate payment method supports current currency
    const selectedMethod = checkout?.availablePaymentMethods?.find(
      (pm: any) => pm.id === paymentMethodId
    );

    if (selectedMethod?.supportedCurrencies?.length > 0) {
      const supportsCurrency = selectedMethod.supportedCurrencies.includes(currencyCode);
      if (!supportsCurrency) {
        setErrors({
          payment: `Ta metoda płatności nie obsługuje waluty ${currencyCode}. Wybierz inną metodę.`,
        });
        return;
      }
    }

    setErrors({});
    setFormState((prev) => ({ ...prev, selectedPaymentMethodId: paymentMethodId }));
  };

  const handlePaymentSubmit = async () => {
    if (!formState.selectedPaymentMethodId) {
      setErrors({ payment: "Wybierz metodę płatności" });
      return;
    }

    // Validate selected payment method still exists and is valid
    const selectedMethod = checkout?.availablePaymentMethods?.find(
      (pm: any) => pm.id === formState.selectedPaymentMethodId
    );

    if (!selectedMethod) {
      setErrors({ payment: "Wybrana metoda płatności jest niedostępna. Wybierz inną metodę." });
      setFormState((prev) => ({ ...prev, selectedPaymentMethodId: null }));
      return;
    }

    // Validate currency support
    if (selectedMethod.supportedCurrencies?.length > 0) {
      const supportsCurrency = selectedMethod.supportedCurrencies.includes(currencyCode);
      if (!supportsCurrency) {
        setErrors({
          payment: `Metoda "${selectedMethod.name}" nie obsługuje waluty ${currencyCode}. Wybierz inną metodę.`,
        });
        return;
      }
    }

    setErrors({});
    setCurrentStep("review");
  };

  // ============================================================================
  // DISCOUNT CODE
  // ============================================================================

  const handleApplyDiscount = async () => {
    if (!formState.discountCode.trim()) {
      return;
    }

    if (!checkoutId) {
      toast.error("Checkout nie znaleziony");
      return;
    }

    try {
      const result = await applyDiscount.mutateAsync({
        checkoutId,
        discountCode: formState.discountCode.trim(),
      });

      const payload = result.checkoutDiscountCodeApply;

      if (payload?.userErrors?.length > 0) {
        toast.error(payload.userErrors[0].message);
        return;
      }

      if (!payload?.checkout) {
        toast.error("Nie udało się zastosować kodu rabatowego");
        return;
      }

      setFormState((prev) => ({
        ...prev,
        appliedDiscountCode: prev.discountCode.trim(),
        discountCode: "",
      }));
      await refetchCheckout();
      toast.success("Kod rabatowy został zastosowany");
    } catch (error: any) {
      toast.error(error.message || "Nie udało się zastosować kodu rabatowego");
    }
  };

  const handleRemoveDiscount = async () => {
    if (!checkoutId || !formState.appliedDiscountCode) {
      return;
    }

    try {
      const result = await removeDiscount.mutateAsync({
        checkoutId,
        discountCode: formState.appliedDiscountCode,
      });

      if (result.checkoutDiscountCodeRemove.userErrors?.length > 0) {
        toast.error(result.checkoutDiscountCodeRemove.userErrors[0].message);
        return;
      }

      setFormState((prev) => ({
        ...prev,
        appliedDiscountCode: null,
      }));
      await refetchCheckout();
      toast.success("Kod rabatowy został usunięty");
    } catch (error: any) {
      toast.error(error.message || "Nie udało się usunąć kodu rabatowego");
    }
  };

  // ============================================================================
  // GIFT CARD
  // ============================================================================

  const handleApplyGiftCard = async () => {
    if (!formState.giftCardCode.trim()) {
      return;
    }

    if (!checkoutId) {
      toast.error("Checkout nie znaleziony");
      return;
    }

    try {
      const result = await applyGiftCard.mutateAsync({
        checkoutId,
        giftCardCode: formState.giftCardCode.trim().toUpperCase(),
      });

      if (result.checkoutGiftCardApply.userErrors?.length > 0) {
        const error = result.checkoutGiftCardApply.userErrors[0];
        // Translate common error codes to user-friendly messages
        const errorMessages: Record<string, string> = {
          GIFT_CARD_NOT_FOUND: "Nie znaleziono karty podarunkowej o podanym kodzie",
          GIFT_CARD_EXPIRED: "Ta karta podarunkowa wygasła",
          GIFT_CARD_DISABLED: "Ta karta podarunkowa jest wyłączona",
          GIFT_CARD_NO_BALANCE: "Ta karta podarunkowa nie ma dostępnego salda",
          GIFT_CARD_ALREADY_APPLIED: "Ta karta jest już zastosowana",
        };
        toast.error(errorMessages[error.code] || error.message);
        return;
      }

      setFormState((prev) => ({
        ...prev,
        giftCardCode: "",
      }));
      await refetchCheckout();
      toast.success("Karta podarunkowa została zastosowana");
    } catch (error: any) {
      toast.error(error.message || "Nie udało się zastosować karty podarunkowej");
    }
  };

  const handleRemoveGiftCard = async (giftCardCode: string) => {
    if (!checkoutId) {
      return;
    }

    try {
      const result = await removeGiftCard.mutateAsync({
        checkoutId,
        giftCardCode,
      });

      if (result.checkoutGiftCardRemove.userErrors?.length > 0) {
        toast.error(result.checkoutGiftCardRemove.userErrors[0].message);
        return;
      }

      await refetchCheckout();
      toast.success("Karta podarunkowa została usunięta");
    } catch (error: any) {
      toast.error(error.message || "Nie udało się usunąć karty podarunkowej");
    }
  };

  // ============================================================================
  // STEP 5: Complete checkout
  // ============================================================================

  const handleCompleteCheckout = async () => {
    if (!formState.acceptTerms) {
      setErrors({ terms: "Musisz zaakceptować regulamin" });
      return;
    }

    if (!formState.selectedPaymentMethodId) {
      setErrors({ payment: "Wybierz metodę płatności" });
      setCurrentStep("payment");
      return;
    }

    setErrors({});

    if (!checkoutId) {
      toast.error("Checkout nie znaleziony. Wróć i spróbuj ponownie.");
      return;
    }

    try {
      const completeResult = await completeCheckout.mutateAsync({
        checkoutId,
        input: {
          paymentMethodId: formState.selectedPaymentMethodId,
        },
      });

      if (completeResult.checkoutComplete.userErrors?.length > 0) {
        const error = completeResult.checkoutComplete.userErrors[0];
        const errorCode = error.code;
        const errorMessage = error.message;

        // Handle specific payment-related error codes
        switch (errorCode) {
          case "INVALID_PAYMENT_METHOD":
          case "PAYMENT_METHOD_NOT_FOUND":
            setErrors({ payment: "Wybrana metoda płatności jest niedostępna. Wybierz inną metodę." });
            setFormState((prev) => ({ ...prev, selectedPaymentMethodId: null }));
            setCurrentStep("payment");
            toast.error("Metoda płatności jest niedostępna");
            break;
          case "PAYMENT_METHOD_CURRENCY_NOT_SUPPORTED":
            setErrors({ payment: `Metoda płatności nie obsługuje wybranej waluty (${currencyCode}).` });
            setCurrentStep("payment");
            toast.error("Waluta nie jest obsługiwana przez tę metodę płatności");
            break;
          case "PAYMENT_DECLINED":
            toast.error("Płatność została odrzucona. Spróbuj ponownie lub wybierz inną metodę.");
            setCurrentStep("payment");
            break;
          case "CHECKOUT_EXPIRED":
            toast.error("Sesja checkout wygasła. Proszę odświeżyć stronę i spróbować ponownie.");
            break;
          case "INVENTORY_NOT_AVAILABLE":
            toast.error("Niektóre produkty są niedostępne. Sprawdź swój koszyk.");
            break;
          default:
            toast.error(errorMessage || "Nie udało się sfinalizować zamówienia");
        }
        return;
      }

      // Handle payment redirect or order completion
      if (completeResult.checkoutComplete.paymentUrl) {
        // Redirect to external payment provider (PayU, Stripe, P24)
        clearCart();
        window.location.href = completeResult.checkoutComplete.paymentUrl;
      } else if (completeResult.checkoutComplete.order) {
        // Order completed directly (COD, free order, bank transfer)
        clearCart();
        const orderId = completeResult.checkoutComplete.order.id;
        const paymentType = formState.selectedPaymentMethodId
          ? checkout?.availablePaymentMethods?.find(
              (pm: any) => pm.id === formState.selectedPaymentMethodId
            )?.type
          : null;

        // Pass payment type to success page for conditional display
        const searchParams = paymentType === 'BANK_TRANSFER' ? '?payment=bank_transfer' : '';
        router.push(`/checkout/success/${orderId}${searchParams}`);
      } else {
        // Fallback: no payment URL and no order - show error
        toast.error("Wystąpił nieoczekiwany błąd. Skontaktuj się z obsługą.");
      }
    } catch (error: any) {
      toast.error(error.message || "Nie udało się sfinalizować zamówienia");
    }
  };

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const goBack = () => {
    const stepOrder: CheckoutStep[] = allGiftCards
      ? ["contact", "payment", "review"]
      : ["contact", "shipping", "delivery", "payment", "review"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const availableShippingRates: ShippingRate[] = checkout?.availableShippingRates || [];
  const shippingRatesReady = checkout?.shippingRatesReady ?? false;

  // Wait for cart data to load
  if (isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Ładowanie...</p>
      </div>
    );
  }

  // Empty cart check
  if (items.length === 0 && !checkoutId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Twój koszyk jest pusty</h1>
        <p className="mt-2 text-muted-foreground">
          Dodaj produkty do koszyka, aby kontynuować zakupy.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/products">Przeglądaj produkty</Link>
        </Button>
      </div>
    );
  }

  // ============================================================================
  // STEP CONFIG
  // ============================================================================

  const allSteps: { id: CheckoutStep; label: string; icon: React.ReactNode }[] = [
    { id: "contact", label: "Kontakt", icon: <User className="h-4 w-4" /> },
    { id: "shipping", label: "Adres", icon: <Package className="h-4 w-4" /> },
    { id: "delivery", label: "Dostawa", icon: <Truck className="h-4 w-4" /> },
    { id: "payment", label: "Płatność", icon: <CreditCard className="h-4 w-4" /> },
    { id: "review", label: "Podsumowanie", icon: <ClipboardCheck className="h-4 w-4" /> },
  ];
  // Skip shipping and delivery steps when all items are gift cards
  const steps = allGiftCards
    ? allSteps.filter((s) => s.id !== "shipping" && s.id !== "delivery")
    : allSteps;

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <Link href="/auth/login" className="text-sm text-primary hover:underline">
          Masz konto? Zaloguj się
        </Link>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  index < currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : index === currentStepIndex
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStepIndex ? <Check className="h-5 w-5" /> : step.icon}
              </div>
              <span
                className={`ml-2 hidden text-sm font-medium sm:inline ${
                  index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-8 sm:mx-4 sm:w-16 transition-colors ${
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Contact */}
          {currentStep === "contact" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dane kontaktowe
                </CardTitle>
                <CardDescription>
                  Podaj swój email i telefon - wyślemy na nie potwierdzenie zamówienia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="twoj@email.pl"
                    value={formState.email}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+48 123 456 789"
                    value={formState.phone}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-destructive">{errors.phone}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Kurier może potrzebować kontaktu w sprawie dostawy
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="marketing"
                    checked={formState.acceptMarketing}
                    onCheckedChange={(checked) =>
                      setFormState((prev) => ({ ...prev, acceptMarketing: checked === true }))
                    }
                  />
                  <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
                    Chcę otrzymywać informacje o promocjach i nowościach
                  </Label>
                </div>

                {/* Gift card recipient fields */}
                {hasGiftCards && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Gift className="h-4 w-4" />
                      Dane odbiorcy karty podarunkowej
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Opcjonalnie: podaj dane osoby, która otrzyma kartę podarunkową
                    </p>
                    {items
                      .filter((item) => item.productType === "GIFT_CARD")
                      .map((item) => (
                        <div key={item.variantId} className="space-y-3 rounded-lg border p-4">
                          <p className="text-sm font-medium">{item.productTitle} — {item.variantTitle}</p>
                          <div>
                            <Label htmlFor={`recipient-email-${item.variantId}`}>E-mail odbiorcy</Label>
                            <Input
                              id={`recipient-email-${item.variantId}`}
                              type="email"
                              placeholder="odbiorca@email.pl"
                              value={giftCardRecipients[item.variantId]?.recipientEmail || ""}
                              onChange={(e) =>
                                setGiftCardRecipients((prev) => ({
                                  ...prev,
                                  [item.variantId]: {
                                    ...prev[item.variantId],
                                    recipientEmail: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`recipient-name-${item.variantId}`}>Imię odbiorcy</Label>
                            <Input
                              id={`recipient-name-${item.variantId}`}
                              type="text"
                              placeholder="Jan"
                              value={giftCardRecipients[item.variantId]?.recipientName || ""}
                              onChange={(e) =>
                                setGiftCardRecipients((prev) => ({
                                  ...prev,
                                  [item.variantId]: {
                                    ...prev[item.variantId],
                                    recipientName: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`recipient-message-${item.variantId}`}>Wiadomość</Label>
                            <Input
                              id={`recipient-message-${item.variantId}`}
                              type="text"
                              placeholder="Wszystkiego najlepszego!"
                              value={giftCardRecipients[item.variantId]?.message || ""}
                              onChange={(e) =>
                                setGiftCardRecipients((prev) => ({
                                  ...prev,
                                  [item.variantId]: {
                                    ...prev[item.variantId],
                                    message: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                <Button onClick={handleContactSubmit} disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronRight className="mr-2 h-4 w-4" />
                  )}
                  {allGiftCards ? "Dalej: Płatność" : "Dalej: Adres dostawy"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Shipping Address */}
          {currentStep === "shipping" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Adres dostawy
                  </CardTitle>
                  <CardDescription>Podaj adres, na który mamy wysłać zamówienie</CardDescription>
                </CardHeader>
                <CardContent>
                  <AddressFormFields
                    prefix="shipping"
                    values={formState.shippingAddress}
                    errors={errors}
                    onChange={(field, value) =>
                      setFormState((prev) => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, [field]: value },
                      }))
                    }
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Adres rozliczeniowy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsBilling"
                      checked={formState.sameAsBilling}
                      onCheckedChange={(checked) =>
                        setFormState((prev) => ({ ...prev, sameAsBilling: checked === true }))
                      }
                    />
                    <Label htmlFor="sameAsBilling" className="cursor-pointer">
                      Taki sam jak adres dostawy
                    </Label>
                  </div>

                  {!formState.sameAsBilling && (
                    <AddressFormFields
                      prefix="billing"
                      values={formState.billingAddress}
                      errors={errors}
                      onChange={(field, value) =>
                        setFormState((prev) => ({
                          ...prev,
                          billingAddress: { ...prev.billingAddress, [field]: value },
                        }))
                      }
                    />
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={goBack} size="lg">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Wstecz
                </Button>
                <Button onClick={handleShippingSubmit} disabled={isLoading} className="flex-1" size="lg">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronRight className="mr-2 h-4 w-4" />
                  )}
                  Dalej: Metoda dostawy
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Delivery Method */}
          {currentStep === "delivery" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Metoda dostawy
                </CardTitle>
                <CardDescription>Wybierz sposób dostarczenia zamówienia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!shippingRatesReady ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Ładowanie metod dostawy...</span>
                  </div>
                ) : availableShippingRates.length === 0 ? (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
                    <p className="text-destructive">
                      Brak dostępnych metod dostawy dla podanego adresu.
                    </p>
                    <Button variant="outline" onClick={goBack} className="mt-4">
                      Zmień adres dostawy
                    </Button>
                  </div>
                ) : (
                  <RadioGroup
                    value={formState.selectedShippingRate || ""}
                    onValueChange={(value) =>
                      setFormState((prev) => ({ ...prev, selectedShippingRate: value }))
                    }
                  >
                    {availableShippingRates.map((rate) => (
                      <div
                        key={rate.handle}
                        className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-muted/50 ${
                          formState.selectedShippingRate === rate.handle
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() =>
                          setFormState((prev) => ({ ...prev, selectedShippingRate: rate.handle }))
                        }
                      >
                        <RadioGroupItem value={rate.handle} id={rate.handle} />
                        <Label
                          htmlFor={rate.handle}
                          className="flex flex-1 cursor-pointer items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Truck className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{rate.title}</span>
                          </div>
                          <span className="font-semibold">{formatPrice(rate.price.amount)}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {errors.shipping && (
                  <p className="text-sm text-destructive">{errors.shipping}</p>
                )}
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={goBack} size="lg">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Wstecz
                  </Button>
                  <Button
                    onClick={handleDeliverySubmit}
                    disabled={isLoading || !formState.selectedShippingRate}
                    className="flex-1"
                    size="lg"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="mr-2 h-4 w-4" />
                    )}
                    Dalej: Płatność
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Payment */}
          {currentStep === "payment" && checkout && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Metoda płatności
                </CardTitle>
                <CardDescription>Wybierz sposób zapłaty za zamówienie</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* PaymentStep component handles payment method selection */}
                <PaymentStep
                  availablePaymentMethods={(checkout.availablePaymentMethods || []).map(
                    (pm: any): PaymentMethod => ({
                      id: pm.id,
                      name: pm.name,
                      provider: pm.provider,
                      type: pm.type,
                      icon: pm.icon,
                      description: pm.description,
                      isDefault: pm.isDefault,
                      supportedCurrencies: pm.supportedCurrencies,
                      position: pm.position || 0,
                    })
                  )}
                  selectedPaymentMethodId={formState.selectedPaymentMethodId}
                  onPaymentMethodSelect={handlePaymentMethodSelect}
                  isLoading={isLoading}
                  error={errors.payment}
                  checkoutReady={!!checkout}
                />
                {errors.payment && (
                  <p className="text-sm text-destructive">{errors.payment}</p>
                )}
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={goBack} size="lg">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Wstecz
                  </Button>
                  <Button
                    onClick={handlePaymentSubmit}
                    disabled={isLoading || !formState.selectedPaymentMethodId}
                    className="flex-1"
                    size="lg"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="mr-2 h-4 w-4" />
                    )}
                    Dalej: Podsumowanie
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Review */}
          {currentStep === "review" && checkout && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Podsumowanie zamówienia
                </CardTitle>
                <CardDescription>Sprawdź wszystkie dane przed finalizacją</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact */}
                <div className="flex items-start justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="mb-1 font-medium">Kontakt</h3>
                    <p className="text-sm text-muted-foreground">{checkout.email}</p>
                    <p className="text-sm text-muted-foreground">{formState.phone}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep("contact")}
                  >
                    Zmień
                  </Button>
                </div>

                {/* Shipping Address (hidden for gift-card-only orders) */}
                {!allGiftCards && (
                  <div className="flex items-start justify-between rounded-lg border p-4">
                    <div>
                      <h3 className="mb-1 font-medium">Adres dostawy</h3>
                      {checkout.shippingAddress && (
                        <p className="text-sm text-muted-foreground">
                          {checkout.shippingAddress.firstName} {checkout.shippingAddress.lastName}
                          <br />
                          {checkout.shippingAddress.address1}
                          {checkout.shippingAddress.address2 && (
                            <>
                              <br />
                              {checkout.shippingAddress.address2}
                            </>
                          )}
                          <br />
                          {checkout.shippingAddress.zip} {checkout.shippingAddress.city}
                          <br />
                          {COUNTRIES.find((c) => c.code === checkout.shippingAddress?.country)?.name ||
                            checkout.shippingAddress.country}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep("shipping")}
                    >
                      Zmień
                    </Button>
                  </div>
                )}

                {/* Shipping Method (hidden for gift-card-only orders) */}
                {!allGiftCards && (
                  <div className="flex items-start justify-between rounded-lg border p-4">
                    <div>
                      <h3 className="mb-1 font-medium">Metoda dostawy</h3>
                      {checkout.shippingLine && (
                        <p className="text-sm text-muted-foreground">
                          {checkout.shippingLine.title} -{" "}
                          {formatPrice(checkout.shippingLine.price.amount)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep("delivery")}
                    >
                      Zmień
                    </Button>
                  </div>
                )}

                {/* Payment Method */}
                <div className="flex items-start justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="mb-1 font-medium">Metoda płatności</h3>
                    {formState.selectedPaymentMethodId && (
                      <p className="text-sm text-muted-foreground">
                        {checkout.availablePaymentMethods?.find(
                          (pm: any) => pm.id === formState.selectedPaymentMethodId
                        )?.name || "Wybrana metoda płatności"}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep("payment")}
                  >
                    Zmień
                  </Button>
                </div>

                {/* Terms acceptance */}
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formState.acceptTerms}
                      onCheckedChange={(checked) =>
                        setFormState((prev) => ({ ...prev, acceptTerms: checked === true }))
                      }
                      className={errors.terms ? "border-destructive" : ""}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="terms" className="cursor-pointer">
                        Akceptuję{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                          regulamin sklepu
                        </Link>{" "}
                        oraz{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                          politykę prywatności
                        </Link>{" "}
                        *
                      </Label>
                      {errors.terms && (
                        <p className="text-sm text-destructive">{errors.terms}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={goBack} size="lg">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Wstecz
                  </Button>
                  <Button
                    onClick={handleCompleteCheckout}
                    disabled={isLoading || !formState.acceptTerms}
                    className="flex-1"
                    size="lg"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Zapłać i zamów
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Twoje zamówienie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Line Items */}
              <div className="space-y-3">
                {(checkout?.lineItems || items).map((item: any) => (
                  <div
                    key={item.id || item.lineId || item.variantId}
                    className="flex gap-3 text-sm"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                      {item.image?.url ? (
                        <img
                          src={item.image.url}
                          alt={item.title || item.productTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2">
                        {item.title || item.productTitle}
                      </p>
                      {item.variantTitle && item.variantTitle !== "Default" && (
                        <p className="text-xs text-muted-foreground">{item.variantTitle}</p>
                      )}
                    </div>
                    <p className="font-medium">
                      {formatPrice(
                        item.totalPrice?.amount ||
                          parseFloat(item.price.amount) * item.quantity
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              {checkoutId && (
                <div className="border-t pt-4">
                  {formState.appliedDiscountCode ? (
                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          {formState.appliedDiscountCode}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveDiscount}
                        disabled={isLoading}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Kod rabatowy"
                        value={formState.discountCode}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, discountCode: e.target.value }))
                        }
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyDiscount}
                        disabled={isLoading || !formState.discountCode.trim()}
                      >
                        {applyDiscount.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Zastosuj"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Gift Card */}
              {checkoutId && (
                <div className="border-t pt-4 space-y-3">
                  <p className="text-sm font-medium">Karta podarunkowa</p>

                  {/* Applied Gift Cards */}
                  {checkout?.appliedGiftCards && checkout.appliedGiftCards.length > 0 && (
                    <div className="space-y-2">
                      {checkout.appliedGiftCards.map((giftCard: any) => (
                        <div
                          key={giftCard.lastCharacters}
                          className="flex items-center justify-between rounded-lg bg-purple-50 p-3 dark:bg-purple-950"
                        >
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-purple-600" />
                            <div className="text-sm">
                              <span className="font-medium text-purple-600">
                                {giftCard.maskedCode}
                              </span>
                              <span className="text-purple-600/70 ml-2">
                                -{formatPrice(giftCard.appliedAmount?.amount || "0")}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveGiftCard(giftCard.maskedCode)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Gift Card Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Kod karty podarunkowej"
                      value={formState.giftCardCode}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, giftCardCode: e.target.value.toUpperCase() }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyGiftCard();
                        }
                      }}
                      className="flex-1 uppercase"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyGiftCard}
                      disabled={isLoading || !formState.giftCardCode.trim()}
                    >
                      {applyGiftCard.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Zastosuj"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Produkty</span>
                  <span>
                    {formatPrice(
                      checkout?.subtotalPrice?.amount ||
                        items.reduce(
                          (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
                          0
                        )
                    )}
                  </span>
                </div>

                {/* Shipping */}
                {checkout?.shippingLine ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dostawa</span>
                    <span>{formatPrice(checkout.totalShippingPrice?.amount || "0")}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dostawa</span>
                    <span className="text-muted-foreground">Obliczona w następnym kroku</span>
                  </div>
                )}

                {/* Discount */}
                {checkout?.totalDiscounts && parseFloat(checkout.totalDiscounts.amount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Rabat</span>
                    <span>-{formatPrice(checkout.totalDiscounts.amount)}</span>
                  </div>
                )}

                {/* Tax */}
                {checkout?.totalTax && parseFloat(checkout.totalTax.amount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Podatek VAT</span>
                    <span>{formatPrice(checkout.totalTax.amount)}</span>
                  </div>
                )}

                {/* Gift Card Deduction */}
                {checkout?.totalGiftCardAmount && parseFloat(checkout.totalGiftCardAmount.amount) > 0 && (
                  <div className="flex justify-between text-sm text-purple-600">
                    <span>Karta podarunkowa</span>
                    <span>-{formatPrice(checkout.totalGiftCardAmount.amount)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                  <span>Razem</span>
                  <span>
                    {formatPrice(
                      checkout?.totalPrice?.amount ||
                        items.reduce(
                          (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
                          0
                        )
                    )}
                  </span>
                </div>

                {/* Payment Due (if different from total due to gift cards) */}
                {checkout?.paymentDue &&
                  checkout?.totalPrice &&
                  parseFloat(checkout.paymentDue.amount) !== parseFloat(checkout.totalPrice.amount) && (
                    <div className="flex justify-between border-t pt-2 text-lg font-bold text-primary">
                      <span>Do zapłaty</span>
                      <span>{formatPrice(checkout.paymentDue.amount)}</span>
                    </div>
                  )}
              </div>

              {/* Security badges */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Bezpieczna płatność
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Szyfrowane dane
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
