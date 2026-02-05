/**
 * Returns/RMA Components
 *
 * Components for handling product returns and RMA (Return Merchandise Authorization)
 * in the storefront.
 *
 * Requirements: R30 - Returns/RMA
 */

export {
  ReturnRequestForm,
  ReturnRequestFormSkeleton,
  type ReturnRequestFormProps,
  type EligibleOrderItem,
} from "./return-request-form";

export {
  ReturnStatusCard,
  ReturnStatusCardSkeleton,
  type ReturnStatusCardProps,
  type ReturnData,
  type ReturnItemData,
  type ReturnStatus,
  type ReturnReason,
  type CompensationType,
} from "./return-status-card";
