import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Award, Lock, TrendingUp } from 'lucide-react-native';
import { Achievement } from '@/services/achievementService';

interface AchievementCardProps {
    achievement: Achievement;
    earned?: boolean;
    progress?: number;
    onPress?: () => void;
}

export default function AchievementCard({
    achievement,
    earned = false,
    progress = 0,
    onPress
}: AchievementCardProps) {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'milestone':
                return '#f59e0b';
            case 'impact':
                return '#059669';
            case 'action_specific':
                return '#3b82f6';
            case 'time_based':
                return '#7c3aed';
            case 'social':
                return '#ef4444';
            case 'leadership':
                return '#dc2626';
            case 'consistency':
                return '#f97316';
            case 'measurement':
                return '#06b6d4';
            default:
                return '#64748b';
        }
    };

    const typeColor = getTypeColor(achievement.type);

    return (
        <TouchableOpacity
            style={[
                styles.container,
                earned ? styles.earnedContainer : styles.lockedContainer
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${typeColor}20` }]}>
                    {earned ? (
                        <Text style={styles.emoji}>{achievement.badge_icon}</Text>
                    ) : (
                        <Lock size={20} color="#94a3b8" />
                    )}
                </View>

                <View style={styles.pointsContainer}>
                    <Award size={14} color={typeColor} />
                    <Text style={[styles.pointsText, { color: typeColor }]}>
                        {achievement.points} pts
                    </Text>
                </View>
            </View>

            <Text style={[styles.name, earned ? styles.earnedText : styles.lockedText]}>
                {achievement.name}
            </Text>

            <Text style={[styles.description, earned ? styles.earnedDescription : styles.lockedDescription]}>
                {achievement.description}
            </Text>

            {!earned && progress > 0 && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: typeColor }]} />
                    </View>
                    <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
                </View>
            )}

            <View style={styles.footer}>
                <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
                    <Text style={[styles.typeText, { color: typeColor }]}>
                        {achievement.type.replace('_', ' ').toUpperCase()}
                    </Text>
                </View>

                {earned && (
                    <View style={styles.earnedBadge}>
                        <TrendingUp size={12} color="#059669" />
                        <Text style={styles.earnedBadgeText}>Earned</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 2,
    },
    earnedContainer: {
        borderColor: '#059669',
        backgroundColor: '#f0fdf4',
    },
    lockedContainer: {
        borderColor: '#e2e8f0',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 24,
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pointsText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    earnedText: {
        color: '#1e293b',
    },
    lockedText: {
        color: '#64748b',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    earnedDescription: {
        color: '#475569',
    },
    lockedDescription: {
        color: '#94a3b8',
    },
    progressContainer: {
        marginBottom: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#e2e8f0',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    earnedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    earnedBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#059669',
        marginLeft: 4,
    },
});