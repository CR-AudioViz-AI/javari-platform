/**
 * Multi-AI Orchestrator - AI-Driven Forecast Engine
 * Phase E: Cost forecasting with trend analysis and anomaly detection
 */

import { costAnalyticsEngine } from './cost-engine';

export interface CostForecast {
  projected7DayCost: number;
  projected30DayCost: number;
  projectedMonthlyRecurring: number;
  anomalyRiskScore: number; // 0-100
  confidenceLevel: number; // 0-100
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  topCostDrivers: { name: string; cost: number; projection: number }[];
  recommendedActions: string[];
  metadata: {
    dataPoints: number;
    forecastMethod: string;
    lastUpdated: Date;
  };
}

export class ForecastEngine {
  /**
   * Generate comprehensive cost forecast
   */
  async generateForecast(): Promise<CostForecast> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get historical data
    const curve = await costAnalyticsEngine.getDailyCostCurve();
    const totalSpend = await costAnalyticsEngine.getTotalSpend(thirtyDaysAgo, now);
    
    if (curve.length < 2) {
      // Insufficient data
      return this.getDefaultForecast();
    }

    // Extract daily totals
    const dailyCosts = this.aggregateToDailyCosts(curve);
    
    // Linear regression for trend
    const trend = this.calculateLinearRegression(dailyCosts);
    
    // Exponential smoothing
    const smoothed = this.exponentialSmoothing(dailyCosts, 0.3);
    
    // Project 7 and 30 days
    const projected7Day = this.projectCost(smoothed, trend, 7);
    const projected30Day = this.projectCost(smoothed, trend, 30);
    
    // Detect anomalies
    const anomalyScore = this.detectAnomalies(dailyCosts);
    
    // Determine trend direction
    const trendDirection = this.getTrendDirection(trend.slope);
    
    // Get top cost drivers
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const drivers = await costAnalyticsEngine.getTopCostDrivers(sevenDaysAgo, now, 5);
    
    // Project each driver
    const topDriversWithProjection = drivers.map(d => ({
      name: d.name,
      cost: d.cost,
      projection: d.cost * (trend.slope > 0 ? 1.2 : 0.9),
    }));
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      trend,
      anomalyScore,
      projected30Day,
      drivers
    );

    return {
      projected7DayCost: projected7Day,
      projected30DayCost: projected30Day,
      projectedMonthlyRecurring: projected30Day,
      anomalyRiskScore: anomalyScore,
      confidenceLevel: this.calculateConfidence(dailyCosts.length, trend),
      trendDirection,
      topCostDrivers: topDriversWithProjection,
      recommendedActions: recommendations,
      metadata: {
        dataPoints: dailyCosts.length,
        forecastMethod: 'linear-regression-exponential-smoothing',
        lastUpdated: now,
      },
    };
  }

  /**
   * Aggregate hourly data to daily costs
   */
  private aggregateToDailyCosts(curve: { timestamp: Date; cost: number }[]): number[] {
    const dailyMap = new Map<string, number>();
    
    for (const point of curve) {
      const day = point.timestamp.toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) || 0) + point.cost);
    }
    
    return Array.from(dailyMap.values());
  }

  /**
   * Linear regression for trend analysis
   */
  private calculateLinearRegression(data: number[]): { slope: number; intercept: number } {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: data[0] || 0 };

    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Exponential smoothing
   */
  private exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
    if (data.length === 0) return [];

    const smoothed: number[] = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      smoothed[i] = alpha * data[i] + (1 - alpha) * smoothed[i - 1];
    }
    
    return smoothed;
  }

  /**
   * Project cost for N days
   */
  private projectCost(
    smoothedData: number[],
    trend: { slope: number; intercept: number },
    days: number
  ): number {
    if (smoothedData.length === 0) return 0;

    const lastValue = smoothedData[smoothedData.length - 1];
    const futureValue = trend.slope * (smoothedData.length + days - 1) + trend.intercept;
    
    // Weighted average of last value and trend projection
    return (lastValue * 0.4 + futureValue * 0.6) * days;
  }

  /**
   * Detect anomalies in cost data
   */
  private detectAnomalies(data: number[]): number {
    if (data.length < 3) return 0;

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    // Count points > 2 standard deviations from mean
    const anomalies = data.filter(val => Math.abs(val - mean) > 2 * stdDev).length;
    
    // Return score 0-100
    return Math.min((anomalies / data.length) * 200, 100);
  }

  /**
   * Determine trend direction
   */
  private getTrendDirection(slope: number): 'increasing' | 'decreasing' | 'stable' {
    if (Math.abs(slope) < 0.01) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Calculate forecast confidence
   */
  private calculateConfidence(
    dataPoints: number,
    trend: { slope: number; intercept: number }
  ): number {
    // More data points = higher confidence
    const dataConfidence = Math.min((dataPoints / 30) * 70, 70);
    
    // Stable trend = higher confidence
    const trendStability = Math.max(0, 30 - Math.abs(trend.slope) * 100);
    
    return Math.min(dataConfidence + trendStability, 100);
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    trend: { slope: number },
    anomalyScore: number,
    projected30Day: number,
    drivers: { type: string; name: string; cost: number }[]
  ): string[] {
    const recommendations: string[] = [];

    // Trend-based recommendations
    if (trend.slope > 0.1) {
      recommendations.push('Cost trend is increasing - review recent provider usage changes');
      recommendations.push('Consider enabling more aggressive caching to reduce costs');
    } else if (trend.slope < -0.1) {
      recommendations.push('Cost trend is decreasing - current optimization strategies are working');
    }

    // Anomaly recommendations
    if (anomalyScore > 50) {
      recommendations.push('High anomaly risk detected - investigate unusual cost spikes');
      recommendations.push('Enable cost alerts for real-time anomaly notifications');
    }

    // Budget recommendations
    if (projected30Day > 100) {
      recommendations.push(`Projected monthly cost ($${projected30Day.toFixed(2)}) exceeds $100 - review budget allocation`);
    }

    // Provider recommendations
    if (drivers.length > 0 && drivers[0].type === 'provider') {
      const topProvider = drivers[0].name;
      recommendations.push(`Top cost driver: ${topProvider} - consider cheaper alternatives for non-critical tasks`);
    }

    // Workflow recommendations
    const workflowDrivers = drivers.filter(d => d.type === 'workflow');
    if (workflowDrivers.length > 0) {
      recommendations.push(`Review workflow "${workflowDrivers[0].name}" for optimization opportunities`);
    }

    // Default recommendation
    if (recommendations.length === 0) {
      recommendations.push('No immediate cost optimization needed - continue monitoring');
    }

    return recommendations;
  }

  /**
   * Get default forecast when insufficient data
   */
  private getDefaultForecast(): CostForecast {
    return {
      projected7DayCost: 0,
      projected30DayCost: 0,
      projectedMonthlyRecurring: 0,
      anomalyRiskScore: 0,
      confidenceLevel: 0,
      trendDirection: 'stable',
      topCostDrivers: [],
      recommendedActions: ['Insufficient data for forecasting - collect more usage data'],
      metadata: {
        dataPoints: 0,
        forecastMethod: 'insufficient-data',
        lastUpdated: new Date(),
      },
    };
  }
}

// Singleton instance
export const forecastEngine = new ForecastEngine();
