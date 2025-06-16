import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Dimensions,
} from 'react-native';
import {
    Award,
    TrendingUp,
    Target,
    Users,
    Clock,
    Star,
    Trophy,
    X,
    Zap
} from 'lucide-react-native';
import { achievementService, Achievement } from '@/services/achievementService';
import AchievementCard from '@/components/AchievementCard';
import MonthlyGoalCard from '@/components/MonthlyGoalCard';
import { useClimate } from '@/contexts/ClimateContext';

const { width } = Dimensions.get('window');

export default function AchievementsScreen() {
    const { userProfile, userActions } = useClimate();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAchievementModal, setShowAchievementModal] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

    // Mock monthly goals
    const [monthlyGoals] = useState([
        {
            id: '1',
            goal_type: 'actions_completed',
            target_value: 10,
            current_value: userProfile?.actions_completed || 0,
            unit: 'actions',
            completed: (userProfile?.actions_completed || 0) >= 10,
        },
        {
            id: '2',
            goal_type: 'volunteer_hours',
            target_value: 20,
            current_value: userProfile?.volunteer_hours || 0,
            unit: 'hours',
            completed: (userProfile?.volunteer_hours || 0) >= 20,
        },
        {
            id: '3',
            goal_type: 'carbon_saved',
            target_value: 50,
            current_value: userProfile?.carbon_saved || 0,
            unit: 'lbs CO₂',
            completed: (userProfile?.carbon_saved || 0) >= 50,
        },
    ]);

    const categories = [
        { id: 'all', label: 'All', icon: Award },
        { id: 'milestone', label: 'Milestones', icon: Trophy },
        { id: 'impact', label: 'Impact', icon: TrendingUp },
        { id: 'social', label: 'Community', icon: Users },
        { id: 'consistency', label: 'Consistency', icon: Clock },
    ];

    useEffect(() => {
        loadAchievements();
    }, [userProfile, userActions]);

    const loadAchievements = () => {
        const allAchievements = achievementService.getAllAchievements();

        // Calculate user stats for achievement checking
        const userStats = {
            actions_completed: userProfile?.actions_completed || 0,
            carbon_saved: userProfile?.carbon_saved || 0,
            volunteer_hours: userProfile?.volunteer_hours || 0,
            tree_planting_actions: userActions.filter(a => a.action_type === 'tree_planting').length,
            cleanup_actions: userActions.filter(a => a.action_type === 'cleanup').length,
            energy_saving_actions: userActions.filter(a => a.action_type === 'energy_saving').length,
            projects_joined: 3, // Mock data
            users_mentored: 1, // Mock data
            daily_streak: 5, // Mock data
            measurements_logged: 8, // Mock data
        };

        // Check which achievements are earned
        const achievementsWithStatus = allAchievements.map(achievement => {
            const userValue = userStats[achievement.requirement.type as keyof typeof userStats] || 0;
            const earned = userValue >= achievement.requirement.value;
            const progress = earned ? 100 : (userValue / achievement.requirement.value) * 100;

            return {
                ...achievement,
                earned,
                progress,
            };
        });

        setAchievements(achievementsWithStatus);
    };

    const getFilteredAchievements = () => {
        if (selectedCategory === 'all') {
            return achievements;
        }
        return achievements.filter(achievement => achievement.type === selectedCategory);
    };

    const getEarnedCount = () => {
        return achievements.filter(a => a.earned).length;
    };

    const getTotalPoints = () => {
        return achievements
            .filter(a => a.earned)
            .reduce((total, a) => total + a.points, 0);
    };

    const getNextAchievement = () => {
        const unearned = achievements.filter(a => !a.earned && a.progress > 0);
        return unearned.sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];
    };

    const handleAchievementPress = (achievement: Achievement) => {
        setSelectedAchievement(achievement);
        setShowAchievementModal(true);
    };

    const filteredAchievements = getFilteredAchievements();
    const earnedCount = getEarnedCount();
    const totalPoints = getTotalPoints();
    const nextAchievement = getNextAchievement();

    return (
        <>
            <ScrollView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Achievements & Goals</Text>
                    <Text style={styles.subtitle}>Track your environmental impact and progress</Text>
                </View>

                {/* Stats Overview */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Trophy size={24} color="#f59e0b" />
                        <Text style={styles.statValue}>{earnedCount}</Text>
                        <Text style={styles.statLabel}>Achievements</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Star size={24} color="#7c3aed" />
                        <Text style={styles.statValue}>{totalPoints}</Text>
                        <Text style={styles.statLabel}>Points Earned</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Target size={24} color="#059669" />
                        <Text style={styles.statValue}>{userProfile?.level || 1}</Text>
                        <Text style={styles.statLabel}>Current Level</Text>
                    </View>
                </View>

                {/* Next Achievement */}
                {nextAchievement && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Next Achievement</Text>
                        <View style={styles.nextAchievementCard}>
                            <View style={styles.nextAchievementHeader}>
                                <Text style={styles.nextAchievementTitle}>{nextAchievement.name}</Text>
                                <Text style={styles.nextAchievementProgress}>
                                    {Math.round(nextAchievement.progress || 0)}% Complete
                                </Text>
                            </View>
                            <Text style={styles.nextAchievementDescription}>
                                {nextAchievement.description}
                            </Text>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${nextAchievement.progress || 0}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.nextAchievementReward}>
                                🏆 {nextAchievement.points} points reward
                            </Text>
                        </View>
                    </View>
                )}

                {/* Monthly Goals */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Monthly Goals</Text>
                    {monthlyGoals.map((goal) => (
                        <MonthlyGoalCard key={goal.id} goal={goal} />
                    ))}
                </View>

                {/* Achievement Categories */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Achievements</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryContainer}
                        contentContainerStyle={styles.categoryContent}
                    >
                        {categories.map((category) => {
                            const IconComponent = category.icon;
                            const categoryAchievements = category.id === 'all'
                                ? achievements
                                : achievements.filter(a => a.type === category.id);
                            const earnedInCategory = categoryAchievements.filter(a => a.earned).length;

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
                                        size={20}
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
                                    <Text
                                        style={[
                                            styles.categoryCount,
                                            selectedCategory === category.id && styles.categoryCountActive,
                                        ]}
                                    >
                                        {earnedInCategory}/{categoryAchievements.length}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Achievement Grid */}
                    <View style={styles.achievementGrid}>
                        {filteredAchievements.map((achievement) => (
                            <AchievementCard
                                key={achievement.id}
                                achievement={achievement}
                                earned={achievement.earned}
                                progress={achievement.progress}
                                onPress={() => handleAchievementPress(achievement)}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Achievement Detail Modal */}
            <Modal
                visible={showAchievementModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Achievement Details</Text>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowAchievementModal(false)}
                        >
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {selectedAchievement && (
                        <ScrollView style={styles.modalContent}>
                            <View style={styles.modalAchievementCard}>
                                <View style={styles.modalIconContainer}>
                                    <Text style={styles.modalEmoji}>{selectedAchievement.badge_icon}</Text>
                                </View>

                                <Text style={styles.modalAchievementName}>
                                    {selectedAchievement.name}
                                </Text>

                                <Text style={styles.modalAchievementDescription}>
                                    {selectedAchievement.description}
                                </Text>

                                <View style={styles.modalStatsContainer}>
                                    <View style={styles.modalStatItem}>
                                        <Award size={20} color="#f59e0b" />
                                        <Text style={styles.modalStatValue}>{selectedAchievement.points}</Text>
                                        <Text style={styles.modalStatLabel}>Points</Text>
                                    </View>

                                    <View style={styles.modalStatItem}>
                                        <Target size={20} color="#3b82f6" />
                                        <Text style={styles.modalStatValue}>
                                            {Math.round(selectedAchievement.progress || 0)}%
                                        </Text>
                                        <Text style={styles.modalStatLabel}>Progress</Text>
                                    </View>
                                </View>

                                <View style={styles.modalRequirement}>
                                    <Text style={styles.modalRequirementTitle}>Requirement:</Text>
                                    <Text style={styles.modalRequirementText}>
                                        {achievementService.formatRequirement(selectedAchievement)}
                                    </Text>
                                </View>

                                {selectedAchievement.earned ? (
                                    <View style={styles.modalEarnedBadge}>
                                        <Zap size={20} color="#059669" />
                                        <Text style={styles.modalEarnedText}>Achievement Unlocked!</Text>
                                    </View>
                                ) : (
                                    <View style={styles.modalProgressContainer}>
                                        <Text style={styles.modalProgressTitle}>Progress</Text>
                                        <View style={styles.modalProgressBar}>
                                            <View
                                                style={[
                                                    styles.modalProgressFill,
                                                    { width: `${selectedAchievement.progress || 0}%` }
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.modalProgressText}>
                                            {Math.round(selectedAchievement.progress || 0)}% Complete
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    )}
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
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 16,
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
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
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
    nextAchievementCard: {
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
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    nextAchievementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    nextAchievementTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    nextAchievementProgress: {
        fontSize: 14,
        fontWeight: '600',
        color: '#f59e0b',
    },
    nextAchievementDescription: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 12,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#f59e0b',
        borderRadius: 4,
    },
    nextAchievementReward: {
        fontSize: 14,
        color: '#059669',
        fontWeight: '600',
        textAlign: 'center',
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
        paddingVertical: 12,
        borderRadius: 20,
        gap: 8,
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
    categoryCount: {
        fontSize: 12,
        color: '#94a3b8',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    categoryCountActive: {
        color: '#dbeafe',
        backgroundColor: '#3b82f6',
    },
    achievementGrid: {
        paddingHorizontal: 20,
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
    modalAchievementCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    modalEmoji: {
        fontSize: 40,
    },
    modalAchievementName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalAchievementDescription: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    modalStatsContainer: {
        flexDirection: 'row',
        gap: 32,
        marginBottom: 24,
    },
    modalStatItem: {
        alignItems: 'center',
    },
    modalStatValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 8,
        marginBottom: 4,
    },
    modalStatLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    modalRequirement: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        width: '100%',
    },
    modalRequirementTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    modalRequirementText: {
        fontSize: 14,
        color: '#64748b',
    },
    modalEarnedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dcfce7',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    modalEarnedText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#059669',
        marginLeft: 8,
    },
    modalProgressContainer: {
        width: '100%',
    },
    modalProgressTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalProgressBar: {
        height: 12,
        backgroundColor: '#e2e8f0',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    modalProgressFill: {
        height: '100%',
        backgroundColor: '#3b82f6',
        borderRadius: 6,
    },
    modalProgressText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
});