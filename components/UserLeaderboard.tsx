import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Award, TrendingUp, Users, Leaf, Crown, Medal, Trophy } from 'lucide-react-native';
import { supabaseService, UserProfile } from '@/services/supabaseService';

interface UserLeaderboardProps {
    currentUserId?: string;
}

export default function UserLeaderboard({ currentUserId }: UserLeaderboardProps) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<'level' | 'actions' | 'carbon'>('level');

    const categories = [
        { id: 'level', label: 'Level', icon: Award },
        { id: 'actions', label: 'Actions', icon: TrendingUp },
        { id: 'carbon', label: 'CO₂ Saved', icon: Leaf },
    ];

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const allUsers = await supabaseService.getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSortedUsers = () => {
        return [...users].sort((a, b) => {
            switch (selectedCategory) {
                case 'level':
                    return b.level - a.level;
                case 'actions':
                    return b.actions_completed - a.actions_completed;
                case 'carbon':
                    return b.carbon_saved - a.carbon_saved;
                default:
                    return 0;
            }
        });
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown size={20} color="#fbbf24" />;
            case 2:
                return <Medal size={20} color="#94a3b8" />;
            case 3:
                return <Trophy size={20} color="#f97316" />;
            default:
                return <Text style={styles.rankNumber}>#{rank}</Text>;
        }
    };

    const getValue = (user: UserProfile) => {
        switch (selectedCategory) {
            case 'level':
                return `Level ${user.level}`;
            case 'actions':
                return `${user.actions_completed} actions`;
            case 'carbon':
                return `${user.carbon_saved} lbs CO₂`;
            default:
                return '';
        }
    };

    const sortedUsers = getSortedUsers();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.subtitle}>Top environmental champions</Text>
            </View>

            {/* Category Selector */}
            <View style={styles.categorySelector}>
                {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category.id && styles.categoryButtonActive,
                            ]}
                            onPress={() => setSelectedCategory(category.id as any)}>
                            <IconComponent
                                size={16}
                                color={selectedCategory === category.id ? '#ffffff' : '#64748b'}
                            />
                            <Text
                                style={[
                                    styles.categoryText,
                                    selectedCategory === category.id && styles.categoryTextActive,
                                ]}>
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Leaderboard */}
            <ScrollView style={styles.leaderboard} showsVerticalScrollIndicator={false}>
                {sortedUsers.map((user, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user.id === currentUserId;

                    return (
                        <View
                            key={user.id}
                            style={[
                                styles.userItem,
                                isCurrentUser && styles.currentUserItem,
                                rank <= 3 && styles.topUserItem
                            ]}>
                            <View style={styles.userLeft}>
                                <View style={styles.rankContainer}>
                                    {getRankIcon(rank)}
                                </View>

                                <Image
                                    source={{
                                        uri: `https://images.pexels.com/photos/${771742 + index}/pexels-photo-${771742 + index}.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`
                                    }}
                                    style={styles.avatar}
                                />

                                <View style={styles.userInfo}>
                                    <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
                                        {user.name}
                                        {isCurrentUser && ' (You)'}
                                    </Text>
                                    <Text style={styles.userLocation}>{user.location}</Text>
                                    <View style={styles.userStats}>
                                        <Text style={styles.userStatsText}>
                                            Level {user.level} • {user.actions_completed} actions
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.userRight}>
                                <Text style={[styles.userValue, rank <= 3 && styles.topUserValue]}>
                                    {getValue(user)}
                                </Text>
                                {user.achievements.length > 0 && (
                                    <View style={styles.achievementBadge}>
                                        <Award size={12} color="#f59e0b" />
                                        <Text style={styles.achievementCount}>{user.achievements.length}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Stats Summary */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Users size={20} color="#1e40af" />
                    <Text style={styles.statValue}>{users.length}</Text>
                    <Text style={styles.statLabel}>Active Users</Text>
                </View>
                <View style={styles.statItem}>
                    <TrendingUp size={20} color="#059669" />
                    <Text style={styles.statValue}>
                        {users.reduce((sum, user) => sum + user.actions_completed, 0)}
                    </Text>
                    <Text style={styles.statLabel}>Total Actions</Text>
                </View>
                <View style={styles.statItem}>
                    <Leaf size={20} color="#dc2626" />
                    <Text style={styles.statValue}>
                        {users.reduce((sum, user) => sum + user.carbon_saved, 0)}
                    </Text>
                    <Text style={styles.statLabel}>lbs CO₂ Saved</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    categorySelector: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 8,
    },
    categoryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#e2e8f0',
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
    leaderboard: {
        flex: 1,
        paddingHorizontal: 20,
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        marginBottom: 8,
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
    currentUserItem: {
        borderWidth: 2,
        borderColor: '#1e40af',
        backgroundColor: '#eff6ff',
    },
    topUserItem: {
        borderLeftWidth: 4,
        borderLeftColor: '#fbbf24',
    },
    userLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rankContainer: {
        width: 32,
        alignItems: 'center',
        marginRight: 12,
    },
    rankNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748b',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    currentUserName: {
        color: '#1e40af',
    },
    userLocation: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    userStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userStatsText: {
        fontSize: 11,
        color: '#94a3b8',
    },
    userRight: {
        alignItems: 'flex-end',
    },
    userValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    topUserValue: {
        color: '#f59e0b',
        fontSize: 16,
    },
    achievementBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 4,
    },
    achievementCount: {
        fontSize: 10,
        fontWeight: '600',
        color: '#92400e',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
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
});