"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Package,
  MinusCircle,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/**
 * Return reason enum matching backend
 */
export type ReturnReason =
  | "DEFECTIVE"
  | "NOT_AS_DESCRIBED"
  | "WRONG_ITEM"
  | "CHANGED_MIND"
  | "BETTER_PRICE"
  | "DAMAGED_SHIPPING"
  | "OTHER";

/**
 * Compensation type enum
 */
export type CompensationType = "REFUND" | "STORE_CREDIT";

/**
 * Order line item that can be returned
 */
export interface ReturnableItem {
  id: string;
  variantId: string;
  productTitle: string;
  variantTitle?: string;
  sku?: string;
  imageUrl?: string;
  quantity: number;
  returnableQuantity: number;
  unitPrice: {
    amount: string;
    currencyCode: string;
  };
}

/**
 * Return reason option with label and description
 */
export interface ReturnReasonOption {
  value: ReturnReason;
  label: string;
  description?: string;
}

export interface ReturnRequestFormProps {
  orderId: string;
  orderNumber: string;
  items: ReturnableItem[];
  reasons?: ReturnReasonOption[];
  onSubmit: (data: ReturnFormData) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export interface ReturnFormData {
  orderId: string;
  reason: ReturnReason;
  customerNote?: string;
  compensationType: CompensationType;
  items: {
    variantId: string;
    quantity: number;
    reason: ReturnReason;
    condition?: string;
  }[];
}

const defaultReasons: ReturnReasonOption[] = [
  {
    value: "DEFECTIVE",
    label: "Defective Product",
    description: "The product has a manufacturing defect",
  },
  {
    value: "NOT_AS_DESCRIBED",
    label: "Not as Described",
    description: "The product does not match the description",
  },
  {
    value: "WRONG_ITEM",
    label: "Wrong Item Received",
    description: "You received a different item",
  },
  {
    value: "CHANGED_MIND",
    label: "Changed My Mind",
    description: "You no longer want the product",
  },
  {
    value: "BETTER_PRICE",
    label: "Found Better Price",
    description: "Found the same product cheaper elsewhere",
  },
  {
    value: "DAMAGED_SHIPPING",
    label: "Damaged in Shipping",
    description: "The product was damaged during delivery",
  },
  { value: "OTHER", label: "Other", description: "Another reason" },
];

const itemConditions = [
  { value: "NEW", label: "New (unused, in original packaging)" },
  { value: "OPENED", label: "Opened (packaging opened but unused)" },
  { value: "USED", label: "Used" },
  { value: "DAMAGED", label: "Damaged" },
];

const formSchema = z.object({
  reason: z.enum([
    "DEFECTIVE",
    "NOT_AS_DESCRIBED",
    "WRONG_ITEM",
    "CHANGED_MIND",
    "BETTER_PRICE",
    "DAMAGED_SHIPPING",
    "OTHER",
  ]),
  customerNote: z.string().optional(),
  compensationType: z.enum(["REFUND", "STORE_CREDIT"]),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        selected: z.boolean(),
        quantity: z.number().min(1),
        reason: z.enum([
          "DEFECTIVE",
          "NOT_AS_DESCRIBED",
          "WRONG_ITEM",
          "CHANGED_MIND",
          "BETTER_PRICE",
          "DAMAGED_SHIPPING",
          "OTHER",
        ]),
        condition: z.string().optional(),
      })
    )
    .refine((items) => items.some((item) => item.selected), {
      message: "Please select at least one item to return",
    }),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * ReturnRequestForm - Multi-step form for creating a return request
 *
 * Steps:
 * 1. Select items to return
 * 2. Provide reason and details
 * 3. Choose compensation type
 * 4. Review and submit
 *
 * Requirements: R30.2, R30.3
 */
export function ReturnRequestForm({
  orderId,
  orderNumber,
  items,
  reasons = defaultReasons,
  onSubmit,
  onCancel,
  className = "",
}: ReturnRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "DEFECTIVE",
      customerNote: "",
      compensationType: "REFUND",
      items: items.map((item) => ({
        variantId: item.variantId,
        selected: false,
        quantity: 1,
        reason: "DEFECTIVE" as ReturnReason,
        condition: "NEW",
      })),
    },
  });

  const watchedItems = form.watch("items");
  const selectedCount = watchedItems.filter((item) => item.selected).length;

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const selectedItems = values.items
        .filter((item) => item.selected)
        .map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          reason: item.reason,
          condition: item.condition,
        }));

      await onSubmit({
        orderId,
        reason: values.reason,
        customerNote: values.customerNote,
        compensationType: values.compensationType,
        items: selectedItems,
      });

      setSubmitSuccess(true);
    } catch (error: any) {
      setSubmitError(error.message || "Failed to create return request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitSuccess) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Return Request Submitted
            </h3>
            <p className="text-muted-foreground mb-6">
              Your return request has been submitted successfully. You will
              receive an email with further instructions.
            </p>
            <Button variant="outline" onClick={onCancel}>
              Back to Order
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Return Request for Order #{orderNumber}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Step 1: Select Items */}
            <div className="space-y-4">
              <h3 className="font-medium">1. Select Items to Return</h3>

              {items.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Returnable Items</AlertTitle>
                  <AlertDescription>
                    There are no items eligible for return in this order.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const isSelected = watchedItems[index]?.selected;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <FormField
                            control={form.control}
                            name={`items.${index}.selected`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={item.returnableQuantity === 0}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {/* Product Image */}
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.productTitle}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}

                          {/* Product Details */}
                          <div className="flex-1">
                            <h4 className="font-medium">{item.productTitle}</h4>
                            {item.variantTitle && (
                              <p className="text-sm text-muted-foreground">
                                {item.variantTitle}
                              </p>
                            )}
                            {item.sku && (
                              <p className="text-xs text-muted-foreground">
                                SKU: {item.sku}
                              </p>
                            )}
                            <p className="text-sm mt-1">
                              Ordered: {item.quantity} | Returnable:{" "}
                              {item.returnableQuantity}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="font-medium">
                              {item.unitPrice.amount}{" "}
                              {item.unitPrice.currencyCode}
                            </p>
                          </div>
                        </div>

                        {/* Item-specific options (shown when selected) */}
                        {isSelected && (
                          <div className="mt-4 pt-4 border-t border-border space-y-4">
                            {/* Quantity selector */}
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Quantity to Return</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                          field.onChange(
                                            Math.max(1, field.value - 1)
                                          )
                                        }
                                      >
                                        <MinusCircle className="h-4 w-4" />
                                      </Button>
                                      <span className="w-12 text-center font-medium">
                                        {field.value}
                                      </span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                          field.onChange(
                                            Math.min(
                                              item.returnableQuantity,
                                              field.value + 1
                                            )
                                          )
                                        }
                                      >
                                        <PlusCircle className="h-4 w-4" />
                                      </Button>
                                      <span className="text-sm text-muted-foreground">
                                        / {item.returnableQuantity}
                                      </span>
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            {/* Item condition */}
                            <FormField
                              control={form.control}
                              name={`items.${index}.condition`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Item Condition</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select condition" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {itemConditions.map((condition) => (
                                        <SelectItem
                                          key={condition.value}
                                          value={condition.value}
                                        >
                                          {condition.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedCount > 0 && (
                <Badge variant="secondary">
                  {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
                </Badge>
              )}
            </div>

            {/* Step 2: Return Reason */}
            <div className="space-y-4">
              <h3 className="font-medium">2. Reason for Return</h3>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Reason</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reasons.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide any additional details about your return..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Help us process your return faster by providing details.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Step 3: Compensation Type */}
            <div className="space-y-4">
              <h3 className="font-medium">3. Compensation Preference</h3>

              <FormField
                control={form.control}
                name="compensationType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="REFUND" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            <span className="font-medium">
                              Refund to Original Payment
                            </span>
                            <p className="text-sm text-muted-foreground">
                              Refund will be processed to your original payment
                              method
                            </p>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="STORE_CREDIT" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            <span className="font-medium">Store Credit</span>
                            <p className="text-sm text-muted-foreground">
                              Receive store credit for future purchases
                            </p>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Error Alert */}
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting || selectedCount === 0}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Return Request
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
