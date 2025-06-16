import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { Newspaper, Search, Filter, TriangleAlert as AlertTriangle, TrendingUp, MapPin, Calendar, X, Zap, Bell, BellOff } from 'lucide-react-native';
import { climateNewsService, ClimateNews } from '@/services/climateNewsService';
import { locationService } from '@/services/locationService';
import ClimateNewsCard from '@/components/ClimateNewsCard';
import { useClimate } from '@/contexts/ClimateContext';

export default function NewsScreen() {
    const { environmentalData } = useClimate();
    const [news, setNews] = useState<ClimateNews[]>([]);
    const [filteredNews, setFilteredNews] = useState<ClimateNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSeverity, setSeverity] = useState('all');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [geolocationEnabled, setGeolocationEnabled] = useState(true);
    const [realTimeUpdates, setRealTimeUpdates] = useState(false);
    const [unsubscribeUpdates, setUnsubscribeUpdates] = useState<(() => void) | null>(null);
    const [error, setError] = useState<string | null>(null);

    const categories = [
        { id: 'all', label: 'All News', icon: Newspaper },
        { id: 'weather_alert', label: 'Weather', icon: AlertTriangle },
        { id: 'local_action', label: 'Local Action', icon: MapPin },
        { id: 'renewable_energy', label: 'Energy', icon: Zap },
        { id: 'safety_alert', label: 'Safety', icon: AlertTriangle },
        { id: 'research', label: 'Research', icon: TrendingUp },
    ];

    const severityFilters = [
        { id: 'all', label: 'All', color: '#64748b' },
        { id: 'critical', label: 'Critical', color: '#ef4444' },
        { id: 'warning', label: 'Warning', color: '#f59e0b' },
        { id: 'info', label: 'Info', color: '#3b82f6' },
    ];

    useEffect(() => {
        loadNews();
        loadUserLocation();

        return () => {
            // Cleanup real-time updates on unmount
            if (unsubscribeUpdates) {
                unsubscribeUpdates();
            }
        };
    }, []);

    useEffect(() => {
        filterNews();
    }, [news, searchText, selectedCategory, selectedSeverity, userLocation, geolocationEnabled]);

    useEffect(() => {
        // Handle real-time updates subscription
        if (realTimeUpdates && userLocation) {
            subscribeToRealTimeUpdates();
        } else if (unsubscribeUpdates) {
            unsubscribeUpdates();
            setUnsubscribeUpdates(null);
        }
    }, [realTimeUpdates, userLocation]);

    const loadUserLocation = async () => {
        try {
            const location = await locationService.getCurrentLocation();
            if (location) {
                setUserLocation({
                    latitude: location.latitude,
                    longitude: location.longitude
                });
            }
        } catch (error) {
            console.error('Error loading user location:', error);
            setGeolocationEnabled(false);
        }
    };

    const subscribeToRealTimeUpdates = async () => {
        try {
            if (!climateNewsService || typeof climateNewsService.subscribeToNewsUpdates !== 'function') {
                console.error('Climate news service subscribeToNewsUpdates method not available');
                return;
            }

            const unsubscribe = await climateNewsService.subscribeToNewsUpdates(
                (newNews) => {
                    setNews(prev => [newNews, ...prev]);
                },
                {
                    location: userLocation ? {
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        radius: 50
                    } : undefined,
                    categories: selectedCategory !== 'all' ? [selectedCategory] : undefined,
                    severities: selectedSeverity !== 'all' ? [selectedSeverity] : undefined,
                }
            );
            setUnsubscribeUpdates(() => unsubscribe);
        } catch (error) {
            console.error('Error subscribing to real-time updates:', error);
        }
    };

    const loadNews = async () => {
        try {
            setLoading(true);
            setError(null);

            // Ensure the service exists and has the method
            if (!climateNewsService || typeof climateNewsService.getClimateNews !== 'function') {
                throw new Error('Climate news service not properly initialized');
            }

            // Load news with enhanced geolocation and AI prioritization
            let allNews: ClimateNews[];

            if (geolocationEnabled && userLocation) {
                // Get nearby news with environmental context
                if (typeof climateNewsService.getNearbyNews === 'function') {
                    const nearbyNews = await climateNewsService.getNearbyNews(
                        userLocation.latitude,
                        userLocation.longitude,
                        50, // 50km radius
                        environmentalData // Pass environmental conditions for AI prioritization
                    );

                    const generalNews = await climateNewsService.getClimateNews({
                        limit: 20,
                        priority: true
                    });

                    // Merge and deduplicate, prioritizing nearby news
                    const newsMap = new Map();
                    [...nearbyNews, ...generalNews].forEach(item => {
                        if (!newsMap.has(item.id)) {
                            newsMap.set(item.id, item);
                        }
                    });

                    allNews = Array.from(newsMap.values());
                } else {
                    // Fallback if getNearbyNews is not available
                    allNews = await climateNewsService.getClimateNews({
                        limit: 50,
                        priority: true
                    });
                }
            } else {
                // Fallback to general news
                allNews = await climateNewsService.getClimateNews({
                    limit: 50,
                    priority: true
                });
            }

            setNews(allNews);
        } catch (error) {
            console.error('Error loading news:', error);
            setError('Failed to load news. Please try again.');
            // Fallback to empty array
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    const filterNews = async () => {
        try {
            let filtered = [...news];

            // Search filter
            if (searchText.trim()) {
                filtered = filtered.filter(item =>
                    item.title.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.content.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.source.toLowerCase().includes(searchText.toLowerCase())
                );
            }

            // Category filter
            if (selectedCategory !== 'all') {
                filtered = filtered.filter(item => item.category === selectedCategory);
            }

            // Severity filter
            if (selectedSeverity !== 'all') {
                filtered = filtered.filter(item => item.severity === selectedSeverity);
            }

            // Apply enhanced geolocation sorting if enabled
            if (geolocationEnabled && userLocation && selectedCategory === 'all' && !searchText.trim()) {
                // Sort by distance if coordinates are available
                filtered.sort((a, b) => {
                    if (a.coordinates && b.coordinates && userLocation) {
                        const distA = calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            a.coordinates.latitude,
                            a.coordinates.longitude
                        );
                        const distB = calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            b.coordinates.latitude,
                            b.coordinates.longitude
                        );
                        return distA - distB;
                    }
                    // Fall back to date sorting
                    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
                });
            } else {
                // Sort by published date (newest first)
                filtered.sort((a, b) =>
                    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
                );
            }

            setFilteredNews(filtered);
        } catch (error) {
            console.error('Error filtering news:', error);
            // Fallback to simple filtering
            let filtered = [...news];

            if (searchText.trim()) {
                filtered = filtered.filter(item =>
                    item.title.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.content.toLowerCase().includes(searchText.toLowerCase())
                );
            }

            if (selectedCategory !== 'all') {
                filtered = filtered.filter(item => item.category === selectedCategory);
            }

            if (selectedSeverity !== 'all') {
                filtered = filtered.filter(item => item.severity === selectedSeverity);
            }

            setFilteredNews(filtered);
        }
    };

    const onRefresh = async () => {
        await Promise.all([loadNews(), loadUserLocation()]);
    };

    const getUrgentNews = () => {
        return filteredNews.filter(item =>
            item.severity === 'critical' || item.severity === 'warning'
        ).slice(0, 3);
    };

    const getLocalNews = () => {
        if (!environmentalData?.location?.city) return [];

        const userCity = environmentalData.location.city.toLowerCase();
        return filteredNews.filter(item =>
            item.location?.toLowerCase().includes(userCity)
        ).slice(0, 5);
    };

    // Helper function to calculate distance between coordinates
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const toRadians = (degrees: number): number => {
        return degrees * (Math.PI / 180);
    };

    const urgentNews = getUrgentNews();
    const localNews = getLocalNews();

    return (
        <>
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Climate News</Text>
                        <Text style={styles.subtitle}>Stay informed about environmental developments</Text>
                        {environmentalData && (
                            <View style={styles.locationInfo}>
                                <MapPin size={16} color="#64748b" />
                                <Text style={styles.locationText}>
                                    {environmentalData.location.city}
                                    {geolocationEnabled && userLocation && ' • Location-based'}
                                    {realTimeUpdates && ' • Live updates'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[styles.actionButton, realTimeUpdates && styles.actionButtonActive]}
                            onPress={() => setRealTimeUpdates(!realTimeUpdates)}
                        >
                            {realTimeUpdates ? (
                                <Bell size={20} color="#ffffff" />
                            ) : (
                                <BellOff size={20} color="#64748b" />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => setShowFilterModal(true)}
                        >
                            <Filter size={24} color="#1e40af" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={20} color="#64748b" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search climate news..."
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholderTextColor="#94a3b8"
                    />
                </View>

                {/* Category Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryContainer}
                    contentContainerStyle={styles.categoryContent}
                >
                    {categories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === category.id && styles.categoryButtonActive,
                                ]}
                                onPress={() => setSelectedCategory(category.id)}
                            >
                                <IconComponent
                                    size={16}
                                    color={selectedCategory === category.id ? '#ffffff' : '#64748b'}
                                />
                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === category.id && styles.categoryTextActive,
                                    ]}
                                >
                                    {category.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Loading State */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1e40af" />
                        <Text style={styles.loadingText}>Loading latest climate news...</Text>
                    </View>
                )}

                {/* Error State */}
                {!loading && error && (
                    <View style={styles.errorContainer}>
                        <AlertTriangle size={32} color="#ef4444" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={loadNews}>
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Urgent News Section */}
                {!loading && !error && urgentNews.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <AlertTriangle size={20} color="#ef4444" />
                            <Text style={styles.sectionTitle}>Urgent Updates</Text>
                        </View>
                        <View style={styles.newsContainer}>
                            {urgentNews.map((item) => (
                                <ClimateNewsCard key={item.id} news={item} />
                            ))}
                        </View>
                    </View>
                )}

                {/* Local News Section */}
                {!loading && !error && localNews.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MapPin size={20} color="#1e40af" />
                            <Text style={styles.sectionTitle}>
                                {geolocationEnabled && userLocation ? 'Nearby News' : 'Local News'}
                            </Text>
                        </View>
                        <View style={styles.newsContainer}>
                            {localNews.map((item) => (
                                <ClimateNewsCard key={item.id} news={item} />
                            ))}
                        </View>
                    </View>
                )}

                {/* All News Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Newspaper size={20} color="#059669" />
                        <Text style={styles.sectionTitle}>
                            {selectedCategory === 'all' ? 'All News' :
                                climateNewsService.getCategoryDisplayName(selectedCategory)}
                        </Text>
                        <Text style={styles.newsCount}>({filteredNews.length})</Text>
                    </View>

                    {!loading && !error && filteredNews.length === 0 ? (
                        <View style={styles.noNewsContainer}>
                            <Newspaper size={48} color="#94a3b8" />
                            <Text style={styles.noNewsTitle}>No news found</Text>
                            <Text style={styles.noNewsText}>
                                {searchText || selectedCategory !== 'all' || selectedSeverity !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Check back later for new updates'
                                }
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.newsContainer}>
                            {filteredNews.map((item) => (
                                <ClimateNewsCard key={item.id} news={item} />
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Enhanced Filter Modal */}
            <Modal
                visible={showFilterModal}
                animationType="slide"
                presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter News</Text>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowFilterModal(false)}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Location Settings */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Location Settings</Text>
                            <TouchableOpacity
                                style={[
                                    styles.filterOption,
                                    geolocationEnabled && styles.filterOptionActive
                                ]}
                                onPress={() => setGeolocationEnabled(!geolocationEnabled)}
                            >
                                <MapPin size={20} color={geolocationEnabled ? '#1e40af' : '#64748b'} />
                                <Text style={[
                                    styles.filterOptionText,
                                    geolocationEnabled && styles.filterOptionTextActive
                                ]}>
                                    Prioritize nearby news
                                </Text>
                                {geolocationEnabled && (
                                    <View style={styles.selectedIndicator} />
                                )}
                            </TouchableOpacity>
                            <Text style={styles.filterDescription}>
                                When enabled, news from your area will be shown first
                            </Text>
                        </View>

                        {/* Real-time Updates */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Real-time Updates</Text>
                            <TouchableOpacity
                                style={[
                                    styles.filterOption,
                                    realTimeUpdates && styles.filterOptionActive
                                ]}
                                onPress={() => setRealTimeUpdates(!realTimeUpdates)}
                            >
                                {realTimeUpdates ? (
                                    <Bell size={20} color="#1e40af" />
                                ) : (
                                    <BellOff size={20} color="#64748b" />
                                )}
                                <Text style={[
                                    styles.filterOptionText,
                                    realTimeUpdates && styles.filterOptionTextActive
                                ]}>
                                    Enable live news updates
                                </Text>
                                {realTimeUpdates && (
                                    <View style={styles.selectedIndicator} />
                                )}
                            </TouchableOpacity>
                            <Text style={styles.filterDescription}>
                                Receive new climate news as it becomes available
                            </Text>
                        </View>

                        {/* Category Filter */}
                        <Text style={styles.filterSectionTitle}>Category</Text>
                        {categories.map((category) => {
                            const IconComponent = category.icon;
                            return (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.filterOption,
                                        selectedCategory === category.id && styles.filterOptionActive
                                    ]}
                                    onPress={() => {
                                        setSelectedCategory(category.id);
                                        setShowFilterModal(false);
                                    }}>
                                    <IconComponent size={20} color={selectedCategory === category.id ? '#1e40af' : '#64748b'} />
                                    <Text style={[
                                        styles.filterOptionText,
                                        selectedCategory === category.id && styles.filterOptionTextActive
                                    ]}>
                                        {category.label}
                                    </Text>
                                    {selectedCategory === category.id && (
                                        <View style={styles.selectedIndicator} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}

                        {/* Severity Filter */}
                        <Text style={styles.filterSectionTitle}>Severity</Text>
                        {severityFilters.map((severity) => (
                            <TouchableOpacity
                                key={severity.id}
                                style={[
                                    styles.filterOption,
                                    selectedSeverity === severity.id && styles.filterOptionActive
                                ]}
                                onPress={() => {
                                    setSeverity(severity.id);
                                    setShowFilterModal(false);
                                }}
                            >
                                <View style={[styles.severityDot, { backgroundColor: severity.color }]} />
                                <Text style={[
                                    styles.filterOptionText,
                                    selectedSeverity === severity.id && styles.filterOptionTextActive
                                ]}>
                                    {severity.label}
                                </Text>
                                {selectedSeverity === severity.id && (
                                    <View style={styles.selectedIndicator} />
                                )}
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.clearFiltersButton}
                            onPress={() => {
                                setSelectedCategory('all');
                                setSeverity('all');
                                setSearchText('');
                                setGeolocationEnabled(true);
                                setRealTimeUpdates(false);
                                setShowFilterModal(false);
                            }}
                        >
                            <Text style={styles.clearFiltersText}>Reset All Filters</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 8,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 6,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        backgroundColor: '#f1f5f9',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    actionButtonActive: {
        backgroundColor: '#1e40af',
        borderColor: '#1e40af',
    },
    filterButton: {
        backgroundColor: '#eff6ff',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#dbeafe',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        marginLeft: 12,
    },
    categoryContainer: {
        marginBottom: 20,
    },
    categoryContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    categoryButtonActive: {
        backgroundColor: '#1e40af',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    categoryTextActive: {
        color: '#ffffff',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 12,
    },
    errorContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        marginHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
        marginTop: 12,
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#1e40af',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 8,
    },
    newsCount: {
        fontSize: 16,
        color: '#64748b',
        marginLeft: 8,
    },
    newsContainer: {
        gap: 0,
    },
    noNewsContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 40,
        marginHorizontal: 20,
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
    noNewsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 8,
    },
    noNewsText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    bottomSpacing: {
        height: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
    },
    modalCloseButton: {
        padding: 8,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    filterSection: {
        marginBottom: 24,
    },
    filterSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
        marginTop: 16,
    },
    filterDescription: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
        marginLeft: 12,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#f8fafc',
    },
    filterOptionActive: {
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    filterOptionText: {
        fontSize: 16,
        color: '#64748b',
        marginLeft: 12,
        flex: 1,
    },
    filterOptionTextActive: {
        color: '#1e40af',
        fontWeight: '600',
    },
    selectedIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#1e40af',
    },
    severityDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    clearFiltersButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    clearFiltersText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
});