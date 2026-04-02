/**
 * Scoring Configuration
 *
 * All magic numbers from the scoring engine are centralized here.
 * Adjust these to tune how aggressively each bonus/penalty affects final scores.
 */

export interface ScoringConfig {
  /** Profile blending weights — how base and fruit profiles are combined */
  blending: {
    /** Weight given to the base profile for standard factors (cream, fruit, refreshing, health, premium) */
    standardBaseWeight: number;
    /** Weight given to the fruit profile for standard factors */
    standardFruitWeight: number;
    /** Weight given to the base profile for cultural factors (culturalFit, exoticAppetite) */
    culturalBaseWeight: number;
    /** Weight given to the fruit profile for cultural factors */
    culturalFruitWeight: number;
  };

  /** Regional flavor bonus tuning */
  regionalBonus: {
    /** Multiplier applied to the raw flavor bonus (0–1.0) to produce final points. Higher = wider spread. */
    maxPoints: number;
  };

  /** Cost efficiency bonus/penalty tuning */
  costBonus: {
    /** The neutral point — cost efficiency scores at this value contribute 0 bonus */
    neutralScore: number;
    /** Maximum absolute bonus/penalty in points. Score range is [-maxPoints, +maxPoints] */
    maxPoints: number;
  };

  /** Price fit bonus tuning */
  priceBonus: {
    /** The neutral priceFit value — scores at this value contribute 0 bonus */
    neutralFit: number;
    /** Multiplier applied to (priceFit - neutralFit) to produce bonus points */
    multiplier: number;
  };

  /** Margin calculation */
  margin: {
    /** Fraction of (baseCost × costIndex × costMultiplier) used in margin formula */
    costFraction: number;
  };

  /** Final score boundaries */
  scoreBounds: {
    min: number;
    max: number;
  };

  /** Maximum number of data-driven insights to show per concept */
  maxInsights: number;
}

export const defaultScoringConfig: ScoringConfig = {
  blending: {
    standardBaseWeight: 0.7,
    standardFruitWeight: 0.3,
    culturalBaseWeight: 0.6,
    culturalFruitWeight: 0.4,
  },

  regionalBonus: {
    maxPoints: 8,
  },

  costBonus: {
    neutralScore: 2.5,
    maxPoints: 5,
  },

  priceBonus: {
    neutralFit: 3,
    multiplier: 2.5,
  },

  margin: {
    costFraction: 0.3,
  },

  scoreBounds: {
    min: 0,
    max: 100,
  },

  maxInsights: 4,
};
