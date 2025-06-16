import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Target, TrendingUp, Calendar, Award } from 'lucide-react-native';

interface MonthlyGoal {
    id: string;
    goal_type: string;
    target_value: number;
    current_value: number;
    unit: string;
    completed: boolean;
}

interface MonthlyGoalCardProps {
    goal: MonthlyGoal;
    onPress?: () => void;
}

export default function MonthlyGoalCard({ goal, onPress }: MonthlyGoalCardProps) {
    const getGoalIcon = (type: string) => {
        switch (type) {
            case 'actions_completed':
                return Target;
            case 'volunteer_hours':
                return Calendar;
            case 'carbon_saved':
                return TrendingUp;
            default:
                return Award;
        }
    };

    const getGoalColor = (type: string) => {
        switch (type) {
            case 'actions_completed':
                return '#3b82f6';
            case 'volunteer_hours':
                return '#f59e0b';
            case 'carbon_saved':
                return '#059669';
            default:
                return '#7c3aed';
        }
    };

    const getGoalTitle = (type: string) => {
        switch (type) {
            case 'actions_completed':
                return 'Complete Actions';
            case 'volunteer_hours':
                return 'Volunteer Hours';
            case 'carbon_saved':
                return 'Save CO₂';
            default:
                return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    };

    const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
    const IconComponent = getGoalIcon(goal.goal_type);
    const goalColor = getGoalColor(goal.goal_type);

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${goalColor}15` }]}>
                    <IconComponent size={20} color={goalColor} />
                </View>

                {goal.completed && (
                    <View style={styles.completedBadge}>
                        <Award size={14} color="#059669" />
                        <Text style={styles.completedText}>Completed</Text>
                    </View>
                )}
            </View>

            <Text style={styles.title}>{getGoalTitle(goal.goal_type)}</Text>

            <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                        {goal.current_value} / {goal.target_value} {goal.unit}
                    </Text>
                    <Text style={[styles.percentageText, { color: goalColor }]}>
                        {Math.round(progress)}%
                    </Text>
                </View>

                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${progress}%`,
                                backgroundColor: goal.completed ? '#059669' : goalColor
                            }
                        ]}
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.remainingText}>
                    {goal.completed
                        ? '🎉 Goal achieved!'
                        : `${goal.target_value - goal.current_value} ${goal.unit} remaining`
                    }
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dcfce7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    completedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
        marginLeft: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    percentageText: {
        fontSize: 18,
        fontWeight: '700',
    },
    progressBar: {
        height: 10,
        backgroundColor: '#e2e8f0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 5,
    },
    footer: {
        alignItems: 'center',
    },
    remainingText: {
        fontSize: 14,
        color: '#64748b',
        fontStyle: 'italic',
        textAlign: 'center',
    },
});