import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { MessageCircle, TrendingUp, Lightbulb, Target, Award, Zap, Leaf, Users, Calendar, ChartBar as BarChart3 } from 'lucide-react-native';
import { useClimate } from '@/contexts/ClimateContext';
import { aiService } from '@/services/aiService';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
    const { environmentalData, userProfile, userActions, loading, refreshData } = useClimate();
    const [aiInsights, setAiInsights] = useState<string[]>([]);
    const [personalizedTips, setPersonalizedTips] = useState<string[]>([]);
    const [impactAnalysis, setImpactAnalysis] = useState<any>(null);

    useEffect(() => {
        loadInsights();
    }, [environmentalData, userProfile]);

    const loadInsights = async () => {
        try {
            if (environmentalData && userProfile) {
                // Load AI-generated insights
                const insights = await aiService.generatePersonalizedInsights(environmentalData, userProfile, userActions);
                setAiInsights(insights.slice(0, 5));

                // Load personalized tips
                const tips = await aiService.generateDynamicTips(environmentalData, userProfile);
                setPersonalizedTips(tips.slice(0, 6));

                // Generate impact analysis
                const analysis = generateImpactAnalysis();
                setImpactAnalysis(analysis);
            }
        } catch (error) {
            console.error('Error loading insights:', error);
        }
    };

    const generateImpactAnalysis = () => {
        if (!userProfile) return null;

        const monthlyGrowth = Math.round((userProfile.actions_completed / 12) * 100) / 100;
        const carbonPerAction = userProfile.actions_completed > 0 ?
            Math.round((userProfile.carbon_saved / userProfile.actions_completed) * 100) / 100 : 0;

        return {
            monthlyGrowth,
            carbonPerAction,
            projectedYearlyImpact: Math.round(monthlyGrowth * 12 * carbonPerAction),
            efficiency: userProfile.volunteer_hours > 0 ?
                Math.round((userProfile.carbon_saved / userProfile.volunteer_hours) * 100) / 100 : 0,
            communityRank: Math.floor(Math.random() * 100) + 1, // Mock ranking
        };
    };

    const getAIInsight = () => {
        if (!environmentalData || !userProfile) return "Welcome to your personalized climate insights!";

        const { airQuality, weather, location } = environmentalData;
        const { level, actions_completed, carbon_saved } = userProfile;

        let insight = `As a Level ${level} Eco Warrior in ${location.city}, you've made significant impact with ${actions_completed} actions and ${carbon_saved} lbs CO₂ saved. `;

        if (airQuality.aqi > 100) {
            insight += `Today's air quality (AQI: ${airQuality.aqi}) presents an opportunity to focus on indoor environmental actions and air quality advocacy.`;
        } else if (weather.temperature > 85) {
            insight += `With temperatures at ${weather.temperature}°F, urban cooling projects would have maximum impact in your area.`;
        } else {
            insight += `Current conditions are ideal for outdoor environmental activities. Your consistent efforts are building a more sustainable future.`;
        }

        return insight;
    };

    const onRefresh = async () => {
        await Promise.all([refreshData(), loadInsights()]);
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>AI Insights</Text>
                <Text style={styles.subtitle}>Personalized climate action guidance</Text>
                {environmentalData && (
                    <Text style={styles.location}>
                        📍 {environmentalData.location.city}, {environmentalData.location.state}
                    </Text>
                )}
            </View>

            {/* Main AI Insight */}
            <View style={styles.mainInsightCard}>
                <View style={styles.insightHeader}>
                    <MessageCircle size={24} color="#1e40af" />
                    <Text style={styles.insightTitle}>Today's AI Analysis</Text>
                </View>
                <Text style={styles.mainInsightText}>
                    {getAIInsight()}
                </Text>
                <View style={styles.insightFooter}>
                    <View style={styles.aiPoweredBadge}>
                        <Zap size={14} color="#7c3aed" />
                        <Text style={styles.aiPoweredText}>AI Powered</Text>
                    </View>
                </View>
            </View>

            {/* Impact Analysis */}
            {impactAnalysis && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Impact Analysis</Text>
                    <View style={styles.impactGrid}>
                        <View style={styles.impactCard}>
                            <TrendingUp size={20} color="#059669" />
                            <Text style={styles.impactValue}>{impactAnalysis.monthlyGrowth}</Text>
                            <Text style={styles.impactLabel}>Actions/Month</Text>
                        </View>
                        <View style={styles.impactCard}>
                            <Leaf size={20} color="#dc2626" />
                            <Text style={styles.impactValue}>{impactAnalysis.carbonPerAction}</Text>
                            <Text style={styles.impactLabel}>CO₂/Action</Text>
                        </View>
                        <View style={styles.impactCard}>
                            <Target size={20} color="#f59e0b" />
                            <Text style={styles.impactValue}>{impactAnalysis.projectedYearlyImpact}</Text>
                            <Text style={styles.impactLabel}>Yearly Projection</Text>
                        </View>
                        <View style={styles.impactCard}>
                            <Award size={20} color="#7c3aed" />
                            <Text style={styles.impactValue}>#{impactAnalysis.communityRank}</Text>
                            <Text style={styles.impactLabel}>Community Rank</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* AI Insights */}
            {aiInsights.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personalized Insights</Text>
                    {aiInsights.map((insight, index) => (
                        <View key={index} style={styles.insightItem}>
                            <View style={styles.insightIcon}>
                                <Lightbulb size={16} color="#f59e0b" />
                            </View>
                            <Text style={styles.insightText}>{insight}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Personalized Tips */}
            {personalizedTips.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Smart Recommendations</Text>
                    {personalizedTips.map((tip, index) => (
                        <View key={index} style={styles.tipCard}>
                            <View style={styles.tipHeader}>
                                <View style={styles.tipIcon}>
                                    <Leaf size={16} color="#059669" />
                                </View>
                                <Text style={styles.tipPriority}>
                                    {index < 2 ? 'High Priority' : index < 4 ? 'Medium Priority' : 'Low Priority'}
                                </Text>
                            </View>
                            <Text style={styles.tipText}>{tip}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Weekly Goals */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>This Week's Focus</Text>
                <View style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <Calendar size={20} color="#1e40af" />
                        <Text style={styles.goalTitle}>Weekly Environmental Goals</Text>
                    </View>
                    <View style={styles.goalItem}>
                        <Text style={styles.goalText}>🌱 Complete 3 environmental actions</Text>
                        <Text style={styles.goalProgress}>2/3 completed</Text>
                    </View>
                    <View style={styles.goalItem}>
                        <Text style={styles.goalText}>🤝 Join 1 community project</Text>
                        <Text style={styles.goalProgress}>0/1 completed</Text>
                    </View>
                    <View style={styles.goalItem}>
                        <Text style={styles.goalText}>📊 Log daily environmental data</Text>
                        <Text style={styles.goalProgress}>5/7 days</Text>
                    </View>
                </View>
            </View>

            {/* Community Insights */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Community Insights</Text>
                <View style={styles.communityCard}>
                    <View style={styles.communityHeader}>
                        <Users size={20} color="#7c3aed" />
                        <Text style={styles.communityTitle}>Local Environmental Trends</Text>
                    </View>
                    <Text style={styles.communityText}>
                        🔥 Tree planting projects are trending in your area (+45% this month)
                    </Text>
                    <Text style={styles.communityText}>
                        💧 Water conservation efforts have increased by 30% locally
                    </Text>
                    <Text style={styles.communityText}>
                        ⚡ Energy efficiency projects show highest community engagement
                    </Text>
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
    header: {
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
    location: {
        fontSize: 14,
        color: '#64748b',
    },
    mainInsightCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginBottom: 24,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#1e40af',
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    insightTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 12,
    },
    mainInsightText: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        marginBottom: 16,
    },
    insightFooter: {
        alignItems: 'flex-end',
    },
    aiPoweredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    aiPoweredText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7c3aed',
        marginLeft: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
        marginHorizontal: 20,
        marginBottom: 16,
    },
    impactGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
    },
    impactCard: {
        backgroundColor: '#ffffff',
        width: (width - 52) / 2,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    impactValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 8,
        marginBottom: 4,
    },
    impactLabel: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
    },
    insightItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    insightIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fffbeb',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    insightText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    tipCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tipHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#dcfce7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipPriority: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    tipText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    goalCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
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
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 12,
    },
    goalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    goalText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    goalProgress: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    communityCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
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
    communityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    communityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 12,
    },
    communityText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 8,
    },
    bottomSpacing: {
        height: 20,
    },
});