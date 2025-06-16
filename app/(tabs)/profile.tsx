import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { User, MapPin, Calendar, Award, TrendingUp, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut, CreditCard as Edit, Star, Target, Leaf, Users, Clock, ChevronRight } from 'lucide-react-native';
import { useClimate } from '@/contexts/ClimateContext';

export default function ProfileScreen() {
  const {
    userProfile,
    userActions,
    environmentalData,
    monthlyGoals,
    loading,
    refreshData,
    updateUserProfile
  } = useClimate();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Update monthly goals when profile loads
    if (userProfile) {
      // Goals are automatically updated in context
    }
  }, [userProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const achievements = [
    { id: 'first_action', title: 'First Action', description: 'Completed your first environmental action', icon: Star, earned: userProfile.actions_completed > 0 },
    { id: 'tree_hugger', title: 'Tree Hugger', description: 'Participated in 5 tree planting events', icon: Leaf, earned: userActions.filter(a => a.action_type === 'tree_planting').length >= 5 },
    { id: 'air_guardian', title: 'Air Quality Guardian', description: 'Monitored air quality for 30 days', icon: Shield, earned: true },
    { id: 'community_builder', title: 'Community Builder', description: 'Recruited 10 volunteers', icon: Users, earned: userProfile.actions_completed >= 10 },
    { id: 'climate_champion', title: 'Climate Champion', description: 'Saved 500 lbs of CO₂', icon: Award, earned: userProfile.carbon_saved >= 500 },
    { id: 'volunteer_hero', title: 'Volunteer Hero', description: 'Completed 50 volunteer hours', icon: Clock, earned: userProfile.volunteer_hours >= 50 },
  ];

  const impactStats = [
    { label: 'Carbon Saved', value: `${userProfile.carbon_saved} lbs`, icon: Leaf, color: '#059669' },
    { label: 'Actions Completed', value: userProfile.actions_completed, icon: Target, color: '#1e40af' },
    { label: 'Volunteer Hours', value: userProfile.volunteer_hours, icon: Clock, color: '#f59e0b' },
    { label: 'Community Rank', value: '#247', icon: TrendingUp, color: '#ef4444' },
  ];

  const menuItems = [
    { title: 'Account Settings', icon: Settings, screen: 'settings' },
    { title: 'Notification Preferences', icon: Bell, screen: 'notifications' },
    { title: 'Privacy & Security', icon: Shield, screen: 'privacy' },
    { title: 'Help & Support', icon: HelpCircle, screen: 'help' },
  ];

  const getLevelProgress = () => {
    const baseXP = userProfile.level * 100;
    const currentXP = userProfile.actions_completed * 10;
    const nextLevelXP = (userProfile.level + 1) * 100;
    const progress = ((currentXP % 100) / 100) * 100;
    return Math.min(progress, 100);
  };

  const getRecentActions = () => {
    return userActions.slice(0, 5);
  };

  const handleViewAllActions = () => {
    const allActionsText = userActions.length > 0
      ? userActions.map((action, index) => `${index + 1}. ${action.description} (${action.date_completed})`).join('\n')
      : 'No actions completed yet. Start your environmental journey today!';

    Alert.alert(
      'All Actions',
      `You have completed ${userProfile.actions_completed} environmental actions!\n\nRecent activities:\n\n${allActionsText}`,
      [{ text: 'OK' }]
    );
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    // In a real app, this would update user preferences in Supabase
    try {
      await updateUserProfile({ notifications_enabled: value });
    } catch (error) {
      console.error('Error updating notification preference:', error);
    }
  };

  const handleLocationToggle = async (value: boolean) => {
    setLocationSharing(value);
    // In a real app, this would update user preferences in Supabase
    try {
      await updateUserProfile({ location_sharing: value });
    } catch (error) {
      console.error('Error updating location preference:', error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Edit size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <View style={styles.locationInfo}>
              <MapPin size={16} color="#64748b" />
              <Text style={styles.locationText}>
                {environmentalData?.location?.city || userProfile.location}
              </Text>
            </View>
            <View style={styles.joinDate}>
              <Calendar size={16} color="#64748b" />
              <Text style={styles.joinDateText}>
                Member since {new Date(userProfile.join_date).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Level Progress */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View style={styles.levelBadge}>
              <Award size={20} color="#f59e0b" />
              <Text style={styles.levelText}>Level {userProfile.level}</Text>
            </View>
            <Text style={styles.levelTitle}>Eco Warrior</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getLevelProgress()}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.floor(getLevelProgress())}% to Level {userProfile.level + 1}
            </Text>
          </View>
        </View>
      </View>

      {/* Impact Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Impact</Text>
        <View style={styles.statsGrid}>
          {impactStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <View key={`stat-${stat.label}-${index}`} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <IconComponent size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent Actions */}
      {userActions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Actions</Text>
            <TouchableOpacity onPress={handleViewAllActions}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionsContainer}>
            {getRecentActions().map((action, index) => (
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
        </View>
      )}

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement, index) => {
            const IconComponent = achievement.icon;
            return (
              <View
                key={`achievement-${achievement.id}-${index}`}
                style={[
                  styles.achievementCard,
                  !achievement.earned && styles.achievementCardLocked
                ]}>
                <View style={[
                  styles.achievementIcon,
                  { backgroundColor: achievement.earned ? '#f59e0b20' : '#f1f5f920' }
                ]}>
                  <IconComponent
                    size={24}
                    color={achievement.earned ? '#f59e0b' : '#94a3b8'}
                  />
                </View>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.earned && styles.achievementTitleLocked
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.earned && styles.achievementDescriptionLocked
                ]}>
                  {achievement.description}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        {/* Quick Settings */}
        <View style={styles.quickSettings}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color="#1e40af" />
              <Text style={styles.settingTitle}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f4f5'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MapPin size={20} color="#059669" />
              <Text style={styles.settingTitle}>Location Sharing</Text>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={handleLocationToggle}
              trackColor={{ false: '#e2e8f0', true: '#10b981' }}
              thumbColor={locationSharing ? '#ffffff' : '#f4f4f5'}
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity key={`menu-${item.title}-${index}`} style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <IconComponent size={20} color="#64748b" />
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>
                <ChevronRight size={16} color="#94a3b8" />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Monthly Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Goals</Text>
        <View style={styles.goalsCard}>
          {monthlyGoals.map((goal, index) => (
            <View key={`goal-${goal.id}-${index}`} style={styles.goalItem}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>
                  {goal.goal_type === 'actions_completed' ? 'Complete Actions' :
                    goal.goal_type === 'volunteer_hours' ? 'Volunteer Hours' :
                      goal.goal_type === 'carbon_saved' ? 'Save CO₂' : goal.goal_type}
                </Text>
                <Text style={styles.goalProgress}>
                  {goal.current_value}/{goal.target_value} {goal.unit}
                </Text>
              </View>
              <View style={styles.goalProgressBar}>
                <View style={[
                  styles.goalProgressFill,
                  {
                    width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%`,
                    backgroundColor: goal.completed ? '#10b981' : '#3b82f6'
                  }
                ]} />
              </View>
              {goal.completed && (
                <Text style={styles.goalCompleted}>🎉 Goal achieved!</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.footerSpace} />
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
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1e40af',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  joinDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinDateText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  levelCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 6,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#dbeafe',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1e40af',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  actionsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    width: '48%',
    padding: 16,
    borderRadius: 16,
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#ffffff',
    width: '48%',
    padding: 16,
    borderRadius: 16,
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
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: '#94a3b8',
  },
  achievementDescription: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  achievementDescriptionLocked: {
    color: '#cbd5e1',
  },
  quickSettings: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  menuList: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  goalsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalItem: {
    marginBottom: 20,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  goalProgress: {
    fontSize: 14,
    color: '#64748b',
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalCompleted: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
  footerSpace: {
    height: 20,
  },
});