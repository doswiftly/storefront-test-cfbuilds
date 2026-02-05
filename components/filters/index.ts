/**
 * Filter Components
 *
 * Dynamic attribute filters for product listings.
 * Uses the GraphQL availableFilters query for filter options.
 *
 * Requirements: R35 - Dynamic Attribute Filters
 */

// Main wrapper component
export {
  DynamicAttributeFilters,
  type DynamicAttributeFiltersProps,
  type AvailableFilters,
  type AppliedFilters,
  type PriceRange,
  type CategoryFilterOption,
} from "./dynamic-attribute-filters";

// Core filter switcher
export {
  AttributeFilter,
  type AttributeFilterProps,
  type AttributeDefinition,
  type AttributeFilterValue,
  type AttributeRangeBounds,
  type AttributeSwatch,
  type AttributeType,
  type Money,
} from "./attribute-filter";

// Individual filter components
export { ColorSwatchFilter, type ColorSwatchFilterProps } from "./color-swatch-filter";
export { CheckboxGroupFilter, type CheckboxGroupFilterProps } from "./checkbox-group-filter";
export { RangeSliderFilter, type RangeSliderFilterProps } from "./range-slider-filter";
export { ToggleFilter, type ToggleFilterProps } from "./toggle-filter";
