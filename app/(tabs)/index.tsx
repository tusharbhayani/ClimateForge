import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Wind, Thermometer, Droplets, Sun, MessageCircle, TrendingUp, Activity, Users, MapPin, Clock, TriangleAlert as AlertTriangle, Leaf, Award, Zap, Newspaper, Target } from 'lucide-react-native';
import { useClimate } from '@/contexts/ClimateContext';
import { climateNewsService, ClimateNews } from '@/services/climateNewsService';
import { aiService } from '@/services/aiService';
import AIChat from '@/components/AIChat';
import ClimateNewsCard from '@/components/ClimateNewsCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { environmentalData, alerts, userProfile, userActions, loading, error, refreshData } = useClimate();
  const [showAIChat, setShowAIChat] = useState(false);
  const [latestNews, setLatestNews] = useState<ClimateNews[]>([]);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    loadLatestNews();
    loadAITips();
  }, [environmentalData, userProfile]);

  const loadLatestNews = async () => {
    try {
      setNewsLoading(true);
      setNewsError(null);
      console.log('Loading latest news...');

      // Ensure the service exists and has the method
      if (!climateNewsService || typeof climateNewsService.getClimateNews !== 'function') {
        throw new Error('Climate news service not properly initialized');
      }

      const news = await climateNewsService.getClimateNews({ limit: 3 });
      console.log('News loaded successfully:', news.length);
      setLatestNews(news);
    } catch (error) {
      console.error('Error loading latest news:', error);
      setNewsError('Failed to load news');
      // Set empty array as fallback
      setLatestNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const loadAITips = async () => {
    try {
      if (environmentalData && userProfile) {
        const tips = await aiService.generateDynamicTips(environmentalData, userProfile);
        setAiTips(tips.slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading AI tips:', error);
      // Set fallback tips
      setAiTips([
        'Check air quality before outdoor activities',
        'Use energy-efficient appliances to reduce consumption',
        'Participate in local environmental community events',
        'Choose sustainable transportation options when possible'
      ]);
    }
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    return '#991b1b';
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Unable to Load Data</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !environmentalData) {
    return (
      <View style={styles.loadingContainer}>
        <Activity size={48} color="#1e40af" />
        <Text style={styles.loadingText}>Loading environmental data...</Text>
        <Text style={styles.loadingSubtext}>Getting your location and current conditions</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshData} />
        }>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getTimeOfDayGreeting()}, {userProfile?.name || 'Eco Warrior'}!
            </Text>
            {environmentalData && (
              <>
                <View style={styles.locationContainer}>
                  <MapPin size={16} color="#64748b" />
                  <Text style={styles.location}>{environmentalData.location.city}, {environmentalData.location.state}</Text>
                </View>
                <View style={styles.lastUpdatedContainer}>
                  <Clock size={14} color="#94a3b8" />
                  <Text style={styles.lastUpdated}>
                    Updated {formatLastUpdated(environmentalData.lastUpdated)}
                  </Text>
                </View>
              </>
            )}
          </View>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => setShowAIChat(true)}>
            <MessageCircle size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* User Level Badge */}
        {userProfile && (
          <View style={styles.levelBadge}>
            <Award size={20} color="#f59e0b" />
            <Text style={styles.levelText}>Level {userProfile.level} Eco Warrior</Text>
            <Text style={styles.levelSubtext}>{userProfile.actions_completed} actions completed</Text>
          </View>
        )}

        {/* Enhanced Air Quality Card */}
        {environmentalData && (
          <View style={styles.aqiCard}>
            <View style={styles.aqiHeader}>
              <Text style={styles.aqiTitle}>Air Quality Index</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveIndicator} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>

            <View style={styles.aqiMainDisplay}>
              <View style={styles.aqiLeft}>
                <Text style={styles.aqiNumber}>{environmentalData.airQuality.aqi}</Text>
                <Text style={[styles.aqiStatus, { color: environmentalData.airQuality.color }]}>
                  {environmentalData.airQuality.status}
                </Text>
              </View>
              <View style={[styles.aqiBadge, { backgroundColor: environmentalData.airQuality.color }]}>
                <Text style={styles.aqiValue}>AQI</Text>
              </View>
            </View>

            <Text style={styles.aqiRecommendation}>
              {environmentalData.airQuality.healthRecommendation}
            </Text>

            <View style={styles.aqiDetails}>
              <View style={styles.aqiDetailItem}>
                <Text style={styles.aqiDetailLabel}>PM2.5</Text>
                <Text style={styles.aqiDetailValue}>{environmentalData.airQuality.pm25.toFixed(1)}</Text>
                <Text style={styles.aqiDetailUnit}>μg/m³</Text>
              </View>
              <View style={styles.aqiDetailItem}>
                <Text style={styles.aqiDetailLabel}>PM10</Text>
                <Text style={styles.aqiDetailValue}>{environmentalData.airQuality.pm10.toFixed(1)}</Text>
                <Text style={styles.aqiDetailUnit}>μg/m³</Text>
              </View>
              <View style={styles.aqiDetailItem}>
                <Text style={styles.aqiDetailLabel}>O₃</Text>
                <Text style={styles.aqiDetailValue}>{environmentalData.airQuality.o3.toFixed(0)}</Text>
                <Text style={styles.aqiDetailUnit}>ppb</Text>
              </View>
              <View style={styles.aqiDetailItem}>
                <Text style={styles.aqiDetailLabel}>NO₂</Text>
                <Text style={styles.aqiDetailValue}>{environmentalData.airQuality.no2.toFixed(0)}</Text>
                <Text style={styles.aqiDetailUnit}>ppb</Text>
              </View>
            </View>
          </View>
        )}

        {/* Enhanced Weather Conditions */}
        {environmentalData && (
          <View style={styles.weatherSection}>
            <Text style={styles.weatherTitle}>Weather Conditions</Text>
            <View style={styles.weatherGrid}>
              <View style={[styles.weatherCard, styles.weatherCardPrimary]}>
                <View style={styles.weatherIconContainer}>
                  <Thermometer size={24} color="#ef4444" />
                </View>
                <Text style={styles.weatherValue}>{environmentalData.weather.temperature}°F</Text>
                <Text style={styles.weatherLabel}>Temperature</Text>
                <Text style={styles.weatherSubtext}>Feels {environmentalData.weather.feelsLike}°F</Text>
              </View>

              <View style={styles.weatherCard}>
                <View style={styles.weatherIconContainer}>
                  <Droplets size={24} color="#0891b2" />
                </View>
                <Text style={styles.weatherValue}>{environmentalData.weather.humidity}%</Text>
                <Text style={styles.weatherLabel}>Humidity</Text>
                <Text style={styles.weatherSubtext}>{environmentalData.weather.description}</Text>
              </View>

              <View style={styles.weatherCard}>
                <View style={styles.weatherIconContainer}>
                  <Wind size={24} color="#059669" />
                </View>
                <Text style={styles.weatherValue}>{environmentalData.weather.windSpeed}</Text>
                <Text style={styles.weatherLabel}>Wind (mph)</Text>
                <Text style={styles.weatherSubtext}>Visibility {environmentalData.weather.visibility} km</Text>
              </View>

              <View style={styles.weatherCard}>
                <View style={styles.weatherIconContainer}>
                  <Sun size={24} color="#f59e0b" />
                </View>
                <Text style={styles.weatherValue}>UV {environmentalData.weather.uvIndex}</Text>
                <Text style={styles.weatherLabel}>UV Index</Text>
                <Text style={styles.weatherSubtext}>
                  {environmentalData.weather.uvIndex > 7 ? 'High' : environmentalData.weather.uvIndex > 3 ? 'Moderate' : 'Low'} exposure
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Latest Climate News */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Newspaper size={20} color="#1e40af" />
              <Text style={styles.sectionTitle}>Latest Climate News</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {newsLoading ? (
            <View style={styles.newsLoadingContainer}>
              <ActivityIndicator size="small" color="#1e40af" />
              <Text style={styles.newsLoadingText}>Loading news...</Text>
            </View>
          ) : newsError ? (
            <View style={styles.newsErrorContainer}>
              <Text style={styles.newsErrorText}>{newsError}</Text>
              <TouchableOpacity onPress={loadLatestNews} style={styles.retryNewsButton}>
                <Text style={styles.retryNewsText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : latestNews.length > 0 ? (
            <View style={styles.newsContainer}>
              {latestNews.map((news) => (
                <ClimateNewsCard key={news.id} news={news} />
              ))}
            </View>
          ) : (
            <View style={styles.noNewsContainer}>
              <Newspaper size={32} color="#94a3b8" />
              <Text style={styles.noNewsText}>No news available</Text>
            </View>
          )}
        </View>

        {/* Recent Actions */}
        {userActions.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Recent Actions</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {userActions.slice(0, 3).map((action, index) => (
              <View key={`action-${action.id}-${index}`} style={styles.actionItem}>
                <View style={styles.actionIcon}>
                  <Leaf size={16} color="#059669" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.description}</Text>
                  <Text style={styles.actionDetails}>
                    {action.impact_value} {action.impact_unit} • {action.location}
                  </Text>
                  <Text style={styles.actionDate}>{action.date_completed}</Text>
                </View>
                {action.rating && (
                  <View style={styles.actionRating}>
                    <Text style={styles.ratingText}>★ {action.rating}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Active Alerts</Text>
              <View style={styles.alertCount}>
                <Text style={styles.alertCountText}>{alerts.length}</Text>
              </View>
            </View>
            {alerts.slice(0, 3).map((alert, index) => (
              <View key={`alert-${alert.id}-${index}`} style={[styles.alertItem, { borderLeftColor: alert.color }]}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: alert.color }]}>
                    <Text style={styles.severityBadgeText}>{alert.severity.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
              </View>
            ))}
            {alerts.length > 3 && (
              <TouchableOpacity style={styles.viewAllAlertsButton}>
                <Text style={styles.viewAllAlertsText}>View all {alerts.length} alerts</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Climate Risks Summary */}
        {environmentalData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Climate Risk Summary</Text>
            <View style={styles.risksGrid}>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Heat Stress</Text>
                <Text style={[styles.riskValue, { color: environmentalData.risks.heat > 3 ? '#ef4444' : '#10b981' }]}>
                  Level {environmentalData.risks.heat}/5
                </Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Flood Risk</Text>
                <Text style={[styles.riskValue, { color: environmentalData.risks.flood === 'High' ? '#ef4444' : '#10b981' }]}>
                  {environmentalData.risks.flood}
                </Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Wildfire</Text>
                <Text style={[styles.riskValue, { color: environmentalData.risks.wildfire > 6 ? '#ef4444' : '#f59e0b' }]}>
                  {environmentalData.risks.wildfire}/10
                </Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Drought</Text>
                <Text style={[styles.riskValue, { color: environmentalData.risks.drought > 2 ? '#f59e0b' : '#10b981' }]}>
                  D{environmentalData.risks.drought}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Stats */}
        {userProfile && (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Activity size={20} color="#1e40af" />
              <Text style={styles.statValue}>{userProfile.actions_completed}</Text>
              <Text style={styles.statLabel}>Actions Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Users size={20} color="#059669" />
              <Text style={styles.statValue}>{userProfile.volunteer_hours}</Text>
              <Text style={styles.statLabel}>Volunteer Hours</Text>
            </View>
            <View style={styles.statCard}>
              <Leaf size={20} color="#dc2626" />
              <Text style={styles.statValue}>{userProfile.carbon_saved}</Text>
              <Text style={styles.statLabel}>lbs CO₂ Saved</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* AI Chat Modal */}
      <Modal
        visible={showAIChat}
        animationType="slide"
        presentationStyle="fullScreen">
        <AIChat onClose={() => setShowAIChat(false)} />
      </Modal>
    </>
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
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
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
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 6,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
  },
  aiButton: {
    backgroundColor: '#1e40af',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1e40af',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
  },
  levelSubtext: {
    fontSize: 12,
    color: '#a16207',
  },
  aqiCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  aqiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  aqiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  aqiMainDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  aqiLeft: {
    flex: 1,
  },
  aqiNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 60,
  },
  aqiStatus: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  aqiBadge: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aqiValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  aqiRecommendation: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
  },
  aqiDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aqiDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  aqiDetailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '600',
  },
  aqiDetailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  aqiDetailUnit: {
    fontSize: 10,
    color: '#94a3b8',
  },
  weatherSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  weatherCard: {
    backgroundColor: '#ffffff',
    width: (width - 64) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  weatherCardPrimary: {
    backgroundColor: '#fef3f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  weatherIconContainer: {
    marginBottom: 8,
  },
  weatherValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  weatherLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '600',
  },
  weatherSubtext: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
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
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  viewAllText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  newsContainer: {
    gap: 0,
  },
  newsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginHorizontal: 20,
  },
  newsLoadingText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  newsErrorContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  newsErrorText: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryNewsButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryNewsText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  noNewsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  noNewsText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  actionDetails: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  actionDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  actionRating: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  alertCount: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  alertItem: {
    borderLeftWidth: 4,
    paddingLeft: 16,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  alertMessage: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  viewAllAlertsButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewAllAlertsText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  risksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  riskItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    width: (width - 72) / 2,
    alignItems: 'center',
  },
  riskLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  riskValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});