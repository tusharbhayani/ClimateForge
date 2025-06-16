import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  Wind,
  Thermometer,
  Droplets,
  Sun,
  Eye,
  CloudRain,
  Activity,
  TrendingUp,
  Calendar,
  MapPin,
} from 'lucide-react-native';
import { useClimate } from '@/contexts/ClimateContext';

const { width } = Dimensions.get('window');

export default function MonitorScreen() {
  const { environmentalData, loading, error } = useClimate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [chartData, setChartData] = useState<any[]>([]);

  const timeframes = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: '7 Days' },
    { id: 'month', label: '30 Days' },
  ];

  // Generate chart data based on selected timeframe
  useEffect(() => {
    const generateChartData = () => {
      let labels: string[] = [];
      let dataPoints = 0;

      if (selectedTimeframe === 'today') {
        labels = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
        dataPoints = 6;
      } else if (selectedTimeframe === 'week') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        dataPoints = 7;
      } else {
        labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
        dataPoints = 30;
      }

      return labels.map((label, i) => {
        const baseAqi = environmentalData?.airQuality?.aqi || 75;
        const baseTemp = environmentalData?.weather?.temperature || 70;

        // Add some variation based on timeframe
        let aqiVariation = 0;
        let tempVariation = 0;

        if (selectedTimeframe === 'today') {
          // Daily pattern - higher AQI during rush hours
          aqiVariation = i === 1 || i === 4 ? 15 : -5; // 9AM and 6PM peaks
          tempVariation = Math.sin((i / 6) * Math.PI) * 10; // Temperature curve
        } else if (selectedTimeframe === 'week') {
          // Weekly pattern - slightly higher on weekdays
          aqiVariation = i < 5 ? 5 : -10; // Weekdays vs weekend
          tempVariation = (Math.random() - 0.5) * 15;
        } else {
          // Monthly pattern - more random variation
          aqiVariation = (Math.random() - 0.5) * 30;
          tempVariation = (Math.random() - 0.5) * 20;
        }

        return {
          label,
          aqi: Math.max(20, Math.min(150, baseAqi + aqiVariation)),
          temp: Math.max(40, Math.min(100, baseTemp + tempVariation)),
        };
      });
    };

    setChartData(generateChartData());
  }, [selectedTimeframe, environmentalData]);

  // Show loading state while data is being fetched
  if (loading && !environmentalData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Loading environmental data...</Text>
      </View>
    );
  }

  // Show error state if there's an error
  if (error && !environmentalData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Unable to Load Data</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  // Show fallback if no environmental data
  if (!environmentalData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No Data Available</Text>
        <Text style={styles.errorMessage}>Environmental data is currently unavailable. Please try again later.</Text>
      </View>
    );
  }

  const getRiskColor = (risk: number | string) => {
    if (typeof risk === 'number') {
      if (risk <= 2) return '#10b981';
      if (risk <= 4) return '#f59e0b';
      return '#ef4444';
    } else {
      if (risk === 'Low') return '#10b981';
      if (risk === 'Moderate') return '#f59e0b';
      return '#ef4444';
    }
  };

  const handleTimeframeChange = (timeframeId: string) => {
    console.log('Changing timeframe to:', timeframeId);
    setSelectedTimeframe(timeframeId);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Environmental Monitor</Text>
        <View style={styles.locationInfo}>
          <MapPin size={16} color="#64748b" />
          <Text style={styles.locationText}>{environmentalData.location.city}</Text>
        </View>
      </View>

      {/* Time Frame Selector */}
      <View style={styles.timeframeSelector}>
        {timeframes.map((timeframe) => (
          <TouchableOpacity
            key={timeframe.id}
            style={[
              styles.timeframeButton,
              selectedTimeframe === timeframe.id && styles.timeframeButtonActive,
            ]}
            onPress={() => handleTimeframeChange(timeframe.id)}>
            <Text
              style={[
                styles.timeframeText,
                selectedTimeframe === timeframe.id && styles.timeframeTextActive,
              ]}>
              {timeframe.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Air Quality Detailed */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Air Quality Details</Text>
          <View style={styles.badge}>
            <Activity size={14} color="#1e40af" />
            <Text style={styles.badgeText}>Live</Text>
          </View>
        </View>

        <View style={styles.aqiMainDisplay}>
          <Text style={styles.aqiNumber}>{environmentalData.airQuality.aqi}</Text>
          <View>
            <Text style={[styles.aqiStatus, { color: environmentalData.airQuality.color }]}>
              {environmentalData.airQuality.status}
            </Text>
            <Text style={styles.aqiSubtext}>Air Quality Index</Text>
          </View>
        </View>

        <View style={styles.pollutantGrid}>
          <View style={styles.pollutantItem}>
            <Text style={styles.pollutantLabel}>PM2.5</Text>
            <Text style={styles.pollutantValue}>{environmentalData.airQuality.pm25.toFixed(1)}</Text>
            <Text style={styles.pollutantUnit}>μg/m³</Text>
          </View>
          <View style={styles.pollutantItem}>
            <Text style={styles.pollutantLabel}>PM10</Text>
            <Text style={styles.pollutantValue}>{environmentalData.airQuality.pm10.toFixed(1)}</Text>
            <Text style={styles.pollutantUnit}>μg/m³</Text>
          </View>
          <View style={styles.pollutantItem}>
            <Text style={styles.pollutantLabel}>O₃</Text>
            <Text style={styles.pollutantValue}>{environmentalData.airQuality.o3.toFixed(0)}</Text>
            <Text style={styles.pollutantUnit}>ppb</Text>
          </View>
          <View style={styles.pollutantItem}>
            <Text style={styles.pollutantLabel}>NO₂</Text>
            <Text style={styles.pollutantValue}>{environmentalData.airQuality.no2.toFixed(0)}</Text>
            <Text style={styles.pollutantUnit}>ppb</Text>
          </View>
        </View>
      </View>

      {/* Weather & Climate */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weather Conditions</Text>
        <View style={styles.weatherDetailGrid}>
          <View style={styles.weatherDetailItem}>
            <Thermometer size={24} color="#ef4444" />
            <View style={styles.weatherDetailContent}>
              <Text style={styles.weatherDetailValue}>{environmentalData.weather.temperature}°F</Text>
              <Text style={styles.weatherDetailLabel}>Temperature</Text>
              <Text style={styles.weatherDetailTrend}>Feels like {environmentalData.weather.feelsLike}°F</Text>
            </View>
          </View>

          <View style={styles.weatherDetailItem}>
            <Droplets size={24} color="#3b82f6" />
            <View style={styles.weatherDetailContent}>
              <Text style={styles.weatherDetailValue}>{environmentalData.weather.humidity}%</Text>
              <Text style={styles.weatherDetailLabel}>Humidity</Text>
              <Text style={styles.weatherDetailTrend}>{environmentalData.weather.description}</Text>
            </View>
          </View>

          <View style={styles.weatherDetailItem}>
            <Wind size={24} color="#059669" />
            <View style={styles.weatherDetailContent}>
              <Text style={styles.weatherDetailValue}>{environmentalData.weather.windSpeed} mph</Text>
              <Text style={styles.weatherDetailLabel}>Wind Speed</Text>
              <Text style={styles.weatherDetailTrend}>Visibility {environmentalData.weather.visibility} km</Text>
            </View>
          </View>

          <View style={styles.weatherDetailItem}>
            <Sun size={24} color="#f59e0b" />
            <View style={styles.weatherDetailContent}>
              <Text style={styles.weatherDetailValue}>UV {environmentalData.weather.uvIndex}</Text>
              <Text style={styles.weatherDetailLabel}>UV Index</Text>
              <Text style={styles.weatherDetailTrend}>
                {environmentalData.weather.uvIndex > 7 ? 'High' : environmentalData.weather.uvIndex > 3 ? 'Moderate' : 'Low'} exposure
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Climate Risks */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Climate Risk Assessment</Text>
        <View style={styles.riskGrid}>
          <View style={styles.riskItem}>
            <View style={styles.riskHeader}>
              <Text style={styles.riskLabel}>Heat Stress</Text>
              <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(environmentalData.risks.heat) }]} />
            </View>
            <Text style={styles.riskValue}>Level {environmentalData.risks.heat}/5</Text>
            <Text style={styles.riskDescription}>
              {environmentalData.risks.heat > 3 ? 'High heat island effect detected' : 'Normal heat levels'}
            </Text>
          </View>

          <View style={styles.riskItem}>
            <View style={styles.riskHeader}>
              <Text style={styles.riskLabel}>Flood Risk</Text>
              <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(environmentalData.risks.flood) }]} />
            </View>
            <Text style={styles.riskValue}>{environmentalData.risks.flood} Risk</Text>
            <Text style={styles.riskDescription}>Based on precipitation patterns</Text>
          </View>

          <View style={styles.riskItem}>
            <View style={styles.riskHeader}>
              <Text style={styles.riskLabel}>Drought Level</Text>
              <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(environmentalData.risks.drought) }]} />
            </View>
            <Text style={styles.riskValue}>D{environmentalData.risks.drought} Category</Text>
            <Text style={styles.riskDescription}>Soil moisture levels monitored</Text>
          </View>

          <View style={styles.riskItem}>
            <View style={styles.riskHeader}>
              <Text style={styles.riskLabel}>Wildfire Risk</Text>
              <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(environmentalData.risks.wildfire) }]} />
            </View>
            <Text style={styles.riskValue}>{environmentalData.risks.wildfire}/10 Scale</Text>
            <Text style={styles.riskDescription}>
              {environmentalData.risks.wildfire > 6 ? 'High risk conditions' : 'Moderate risk levels'}
            </Text>
          </View>
        </View>
      </View>

      {/* Trends Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {selectedTimeframe === 'today' ? 'Today\'s Trends' :
            selectedTimeframe === 'week' ? '7-Day Trends' :
              '30-Day Trends'}
        </Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartGrid}>
            {chartData.map((data, index) => (
              <View key={`${selectedTimeframe}-chart-${index}-${data.label}`} style={styles.chartBar}>
                <View
                  style={[
                    styles.chartBarFill,
                    {
                      height: `${Math.min((data.aqi / 150) * 100, 100)}%`,
                      backgroundColor: data.aqi > 100 ? '#f59e0b' : data.aqi > 50 ? '#10b981' : '#3b82f6'
                    }
                  ]}
                />
                <Text style={styles.chartLabel}>{data.label}</Text>
                <Text style={styles.chartValue}>{Math.round(data.aqi)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.legendText}>Excellent (0-50)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Good (51-100)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Moderate (101+)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Health Recommendations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health Recommendations</Text>
        <View style={styles.recommendationItem}>
          <View style={styles.recommendationIcon}>
            <Eye size={16} color="#1e40af" />
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>Outdoor Activities</Text>
            <Text style={styles.recommendationText}>
              {environmentalData.airQuality.healthRecommendation}
            </Text>
          </View>
        </View>

        <View style={styles.recommendationItem}>
          <View style={styles.recommendationIcon}>
            <Sun size={16} color="#f59e0b" />
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>UV Protection</Text>
            <Text style={styles.recommendationText}>
              {environmentalData.weather.uvIndex > 7
                ? `High UV levels (${environmentalData.weather.uvIndex}). Use SPF 30+ sunscreen and seek shade during peak hours (10am-4pm).`
                : environmentalData.weather.uvIndex > 3
                  ? `Moderate UV levels (${environmentalData.weather.uvIndex}). Consider sunscreen for extended outdoor activities.`
                  : `Low UV levels (${environmentalData.weather.uvIndex}). Minimal protection needed.`
              }
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 6,
  },
  timeframeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: '#1e40af',
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  timeframeTextActive: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    marginLeft: 4,
  },
  aqiMainDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  aqiNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1e293b',
    marginRight: 20,
  },
  aqiStatus: {
    fontSize: 20,
    fontWeight: '600',
  },
  aqiSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  pollutantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  pollutantItem: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    width: (width - 72) / 2,
    alignItems: 'center',
  },
  pollutantLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  pollutantValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  pollutantUnit: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  weatherDetailGrid: {
    gap: 16,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  weatherDetailContent: {
    marginLeft: 16,
    flex: 1,
  },
  weatherDetailValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  weatherDetailLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  weatherDetailTrend: {
    fontSize: 12,
    color: '#059669',
    marginTop: 4,
  },
  riskGrid: {
    gap: 16,
  },
  riskItem: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  riskIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  riskValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  riskDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  chartContainer: {
    marginTop: 16,
  },
  chartGrid: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 8,
    marginBottom: 16,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
    minHeight: 10,
  },
  chartLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  chartValue: {
    fontSize: 10,
    color: '#1e293b',
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#64748b',
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 20,
  },
});