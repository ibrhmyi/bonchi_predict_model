/**
 * Scoring Configuration
 *
 * All magic numbers from the scoring engine are centralized here.
 * Adjust these to tune how aggressively each bonus/penalty affects final scores.
 */

export interface ScoringConfig {
  /** Profile blending weights — how base and fruit profiles are combined */
  blending: {
    standardBaseWeight: number;
    standardFruitWeight: number;
    culturalBaseWeight: number;
    culturalFruitWeight: number;
  };

  /** Regional flavor bonus tuning */
  regionalBonus: {
    /** Multiplier applied to the familiarity-derived bonus (0-1) to produce final points */
    maxPoints: number;
  };

  /** Price fit bonus tuning */
  priceBonus: {
    /** The neutral priceFit value — scores at this value contribute 0 bonus */
    neutralFit: number;
    /** Multiplier applied to (priceFit - neutralFit) to produce bonus points */
    multiplier: number;
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

  priceBonus: {
    neutralFit: 3,
    multiplier: 2.5,
  },

  scoreBounds: {
    min: 0,
    max: 100,
  },

  maxInsights: 4,
};
