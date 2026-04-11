import { Category, Condition } from '../types';

// Default pricing configuration
export const DEFAULT_PRICING = {
  [Category.MOBILE]: { ratePerKg: 100, conditionFactors: { [Condition.WORKING]: 1.0, [Condition.PARTIAL]: 0.7, [Condition.SCRAP]: 0.4 } },
  [Category.LAPTOP]: { ratePerKg: 150, conditionFactors: { [Condition.WORKING]: 1.0, [Condition.PARTIAL]: 0.7, [Condition.SCRAP]: 0.4 } },
  [Category.COMPUTER]: { ratePerKg: 120, conditionFactors: { [Condition.WORKING]: 1.0, [Condition.PARTIAL]: 0.7, [Condition.SCRAP]: 0.4 } },
  [Category.TV]: { ratePerKg: 80, conditionFactors: { [Condition.WORKING]: 1.0, [Condition.PARTIAL]: 0.7, [Condition.SCRAP]: 0.4 } },
  [Category.PRINTER]: { ratePerKg: 90, conditionFactors: { [Condition.WORKING]: 1.0, [Condition.PARTIAL]: 0.7, [Condition.SCRAP]: 0.4 } },
  [Category.BATTERY]: { ratePerKg: 60, conditionFactors: { [Condition.WORKING]: 1.0, [Condition.PARTIAL]: 0.7, [Condition.SCRAP]: 0.4 } },
  [Category.OTHER]: { ratePerKg: 70, conditionFactors: { [Condition.WORKING]: 1.0, [Condition.PARTIAL]: 0.7, [Condition.SCRAP]: 0.4 } },
};

/**
 * Calculate final price based on category, weight, and condition
 */
export const calculatePrice = (
  category: Category,
  weight: number,
  condition: Condition,
  customPricing?: typeof DEFAULT_PRICING
): number => {
  const pricing = customPricing || DEFAULT_PRICING;
  const categoryPricing = pricing[category];
  
  if (!categoryPricing) {
    return 0;
  }

  const ratePerKg = categoryPricing.ratePerKg;
  const conditionFactor = categoryPricing.conditionFactors[condition] || 0.4;
  
  return ratePerKg * weight * conditionFactor;
};

/**
 * Calculate estimated price using assumed weight
 */
export const calculateEstimatedPrice = (
  category: Category,
  quantity: number,
  condition: Condition = Condition.PARTIAL,
  customPricing?: typeof DEFAULT_PRICING
): number => {
  // Assumed average weight per item (in kg)
  const assumedWeights: Record<Category, number> = {
    [Category.MOBILE]: 0.2,
    [Category.LAPTOP]: 2.0,
    [Category.COMPUTER]: 8.0,
    [Category.TV]: 10.0,
    [Category.PRINTER]: 5.0,
    [Category.BATTERY]: 0.5,
    [Category.OTHER]: 1.0,
  };

  const assumedWeight = (assumedWeights[category] || 1.0) * quantity;
  return calculatePrice(category, assumedWeight, condition, customPricing);
};
