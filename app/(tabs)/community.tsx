import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import {
  Users,
  Calendar,
  MapPin,
  Search,
  Filter,
  TreePine,
  Trash2,
  GraduationCap,
  Heart,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Droplets,
  ChevronRight,
  Star,
  Plus,
  X,
} from 'lucide-react-native';
import { useClimate } from '@/contexts/ClimateContext';
import UserLeaderboard from '@/components/UserLeaderboard';

const { width } = Dimensions.get('window');

export default function CommunityScreen() {
  const {
    communityProjects,
    communityStats,
    userProfile,
    environmentalData,
    joinProject,
    leaveProject,
    loading,
    refreshData,
    joinedProjects,
    addProject
  } = useClimate();

  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState(communityProjects);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    type: 'tree-planting',
    location: '',
    date: '',
    time: '',
    maxParticipants: 20,
    requirements: [] as string[],
    impactGoal: '',
  });

  const filters = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'tree-planting', label: 'Trees', icon: TreePine },
    { id: 'cleanup', label: 'Cleanup', icon: Trash2 },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'energy', label: 'Energy', icon: Zap },
    { id: 'conservation', label: 'Conservation', icon: Droplets },
  ];

  // Filter projects based on search and filter criteria
  useEffect(() => {
    let filtered = communityProjects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchText.toLowerCase()) ||
        project.description.toLowerCase().includes(searchText.toLowerCase()) ||
        project.location.toLowerCase().includes(searchText.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || project.type === selectedFilter;

      // Update isJoined status based on joinedProjects
      project.isJoined = joinedProjects.includes(project.id);

      return matchesSearch && matchesFilter;
    });

    // AI-based prioritization based on environmental conditions
    if (environmentalData) {
      filtered = filtered.sort((a, b) => {
        let aScore = 0;
        let bScore = 0;

        // Prioritize based on current environmental conditions
        if (environmentalData.airQuality.aqi > 100) {
          if (a.type === 'tree-planting') aScore += 3;
          if (b.type === 'tree-planting') bScore += 3;
          if (a.type === 'cleanup') aScore += 2;
          if (b.type === 'cleanup') bScore += 2;
        }

        if (environmentalData.weather.temperature > 85) {
          if (a.type === 'tree-planting') aScore += 2;
          if (b.type === 'tree-planting') bScore += 2;
          if (a.type === 'energy') aScore += 1;
          if (b.type === 'energy') bScore += 1;
        }

        if (environmentalData.risks.wildfire > 6) {
          if (a.type === 'cleanup') aScore += 3;
          if (b.type === 'cleanup') bScore += 3;
        }

        // Prioritize by distance (closer projects get higher score)
        if (a.distance && b.distance) {
          if (a.distance < b.distance) aScore += 1;
          if (b.distance < a.distance) bScore += 1;
        }

        return bScore - aScore;
      });
    }

    setFilteredProjects(filtered);
  }, [communityProjects, searchText, selectedFilter, environmentalData, joinedProjects]);

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'tree-planting':
        return TreePine;
      case 'cleanup':
        return Trash2;
      case 'education':
        return GraduationCap;
      case 'energy':
        return Zap;
      case 'conservation':
        return Droplets;
      default:
        return Users;
    }
  };

  const getProjectColor = (type: string) => {
    switch (type) {
      case 'tree-planting':
        return '#059669';
      case 'cleanup':
        return '#0891b2';
      case 'education':
        return '#7c3aed';
      case 'energy':
        return '#f59e0b';
      case 'conservation':
        return '#06b6d4';
      default:
        return '#1e40af';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#10b981';
      case 'Moderate':
        return '#f59e0b';
      case 'Hard':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const handleJoinProject = async (projectId: string) => {
    const success = await joinProject(projectId);
    if (success) {
      Alert.alert('Success!', 'You have successfully joined this project. Check your profile for updates.');
    } else {
      Alert.alert('Error', 'Failed to join project. Please try again.');
    }
  };

  const handleLeaveProject = async (projectId: string) => {
    Alert.alert(
      'Leave Project',
      'Are you sure you want to leave this project?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            const success = await leaveProject(projectId);
            if (success) {
              Alert.alert('Left Project', 'You have left this project.');
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleCreateProject = () => {
    setShowCreateProject(true);
  };

  const handleCreateProjectSubmit = async () => {
    if (!newProject.title || !newProject.description || !newProject.type || !newProject.location) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      // Set default values if not provided
      const projectData = {
        title: newProject.title,
        description: newProject.description,
        type: newProject.type,
        location: newProject.location,
        date: newProject.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: newProject.time || '10:00 AM',
        maxParticipants: parseInt(newProject.maxParticipants.toString()) || 20,
        requirements: newProject.requirements.length > 0 ? newProject.requirements : ['Comfortable clothing', 'Water bottle', 'Sun protection'],
        impactGoal: newProject.impactGoal || 'Community environmental impact',
      };

      const success = await addProject(projectData);

      if (success) {
        Alert.alert(
          'Project Created!',
          'Your project has been submitted successfully. It will appear in the community feed.',
          [{
            text: 'OK', onPress: () => {
              setShowCreateProject(false);
              setNewProject({
                title: '',
                description: '',
                type: 'tree-planting',
                location: '',
                date: '',
                time: '',
                maxParticipants: 20,
                requirements: [],
                impactGoal: '',
              });
              refreshData();
            }
          }]
        );
      } else {
        Alert.alert('Error', 'Failed to create project. Please try again.');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project. Please try again.');
    }
  };

  // Find featured project (AI-recommended based on conditions)
  const getFeaturedProject = () => {
    if (!environmentalData || filteredProjects.length === 0) return null;

    // AI logic to recommend featured project
    let featuredProject = filteredProjects.find(p => !p.isJoined);

    if (environmentalData.airQuality.aqi > 100) {
      // Prioritize tree planting for poor air quality
      featuredProject = filteredProjects.find(p => p.type === 'tree-planting' && !p.isJoined);
    } else if (environmentalData.weather.temperature > 90) {
      // Prioritize cooling projects for high heat
      featuredProject = filteredProjects.find(p =>
        (p.type === 'tree-planting' || p.type === 'energy') && !p.isJoined
      );
    } else if (environmentalData.risks.wildfire > 6) {
      // Prioritize cleanup for wildfire risk
      featuredProject = filteredProjects.find(p => p.type === 'cleanup' && !p.isJoined);
    }

    return featuredProject || filteredProjects[0];
  };

  const featuredProject = getFeaturedProject();

  // AI-generated recommendations based on environmental data
  const getAIRecommendations = () => {
    if (!environmentalData) return [];

    const recommendations = [];

    if (environmentalData.airQuality.aqi > 100) {
      recommendations.push({
        type: 'tree-planting',
        reason: 'Poor air quality detected - tree planting can improve local air quality by 25%',
        urgency: 'high'
      });
    }

    if (environmentalData.weather.temperature > 85) {
      recommendations.push({
        type: 'tree-planting',
        reason: 'High temperatures - urban trees can reduce local temperature by 2-8°F',
        urgency: 'moderate'
      });
    }

    if (environmentalData.risks.wildfire > 6) {
      recommendations.push({
        type: 'cleanup',
        reason: 'High wildfire risk - removing dry vegetation reduces fire hazards',
        urgency: 'high'
      });
    }

    return recommendations;
  };

  const aiRecommendations = getAIRecommendations();

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Community Action</Text>
            <Text style={styles.subtitle}>Join local environmental initiatives</Text>
            {environmentalData && (
              <View style={styles.locationInfo}>
                <MapPin size={16} color="#64748b" />
                <Text style={styles.locationText}>{environmentalData.location.city}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.leaderboardButton}
              onPress={() => setShowLeaderboard(true)}>
              <Award size={20} color="#f59e0b" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateProject}>
              <Plus size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Recommendations */}
        {aiRecommendations.length > 0 && (
          <View style={styles.aiRecommendationsCard}>
            <View style={styles.aiHeader}>
              <Star size={20} color="#f59e0b" />
              <Text style={styles.aiTitle}>AI Recommendations</Text>
            </View>
            {aiRecommendations.map((rec, index) => (
              <View key={index} style={styles.aiRecommendation}>
                <View style={[styles.urgencyDot, {
                  backgroundColor: rec.urgency === 'high' ? '#ef4444' : '#f59e0b'
                }]} />
                <Text style={styles.aiRecommendationText}>{rec.reason}</Text>
              </View>
            ))}
          </View>
        )}

        {/* User Stats */}
        {communityStats && userProfile && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Award size={20} color="#f59e0b" />
              <Text style={styles.statValue}>Level {userProfile.level}</Text>
              <Text style={styles.statLabel}>Eco Warrior</Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={20} color="#059669" />
              <Text style={styles.statValue}>{userProfile.actions_completed}</Text>
              <Text style={styles.statLabel}>Actions Done</Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={20} color="#1e40af" />
              <Text style={styles.statValue}>{userProfile.volunteer_hours}</Text>
              <Text style={styles.statLabel}>Hours Volunteered</Text>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search opportunities..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
            <Filter size={20} color="#1e40af" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}>
          {filters.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.id && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}>
                <IconComponent
                  size={16}
                  color={selectedFilter === filter.id ? '#ffffff' : '#64748b'}
                />
                <Text
                  style={[
                    styles.filterTabText,
                    selectedFilter === filter.id && styles.filterTabTextActive,
                  ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Project */}
        {featuredProject && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Recommended for You</Text>
            <View style={styles.featuredCard}>
              <Image source={{ uri: featuredProject.imageUrl }} style={styles.featuredImage} />
              <View style={styles.featuredContent}>
                <View style={styles.featuredHeader}>
                  <View style={styles.featuredBadge}>
                    <Star size={12} color="#ffffff" />
                    <Text style={styles.featuredBadgeText}>AI PICK</Text>
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(featuredProject.difficulty) }]}>
                    <Text style={styles.difficultyBadgeText}>{featuredProject.difficulty}</Text>
                  </View>
                </View>
                <Text style={styles.featuredTitle}>{featuredProject.title}</Text>
                <Text style={styles.featuredDescription} numberOfLines={3}>
                  {featuredProject.description}
                </Text>
                <View style={styles.featuredStats}>
                  <View style={styles.featuredStatItem}>
                    <Users size={16} color="#64748b" />
                    <Text style={styles.featuredStatText}>
                      {featuredProject.participants}/{featuredProject.maxParticipants} joined
                    </Text>
                  </View>
                  <View style={styles.featuredStatItem}>
                    <Calendar size={16} color="#64748b" />
                    <Text style={styles.featuredStatText}>
                      {formatDate(featuredProject.date)} • {featuredProject.time}
                    </Text>
                  </View>
                  <View style={styles.featuredStatItem}>
                    <MapPin size={16} color="#64748b" />
                    <Text style={styles.featuredStatText}>
                      {featuredProject.location} • {featuredProject.distance}mi
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.featuredButton,
                    featuredProject.isJoined && styles.featuredButtonJoined
                  ]}
                  onPress={() => featuredProject.isJoined
                    ? handleLeaveProject(featuredProject.id)
                    : handleJoinProject(featuredProject.id)
                  }>
                  <Heart
                    size={16}
                    color="#ffffff"
                    fill={featuredProject.isJoined ? "#ffffff" : "transparent"}
                  />
                  <Text style={styles.featuredButtonText}>
                    {featuredProject.isJoined ? 'Joined' : 'Join Initiative'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Available Opportunities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Opportunities</Text>
            <Text style={styles.sectionSubtitle}>{filteredProjects.length} projects found</Text>
          </View>

          {filteredProjects.length === 0 ? (
            <View style={styles.noProjectsCard}>
              <Users size={48} color="#94a3b8" />
              <Text style={styles.noProjectsTitle}>No projects found</Text>
              <Text style={styles.noProjectsText}>
                {searchText || selectedFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Check back later for new opportunities'
                }
              </Text>
            </View>
          ) : (
            filteredProjects.map((project) => {
              const IconComponent = getProjectIcon(project.type);
              const iconColor = getProjectColor(project.type);

              return (
                <View key={project.id} style={styles.projectCard}>
                  <View style={styles.projectImageContainer}>
                    <Image source={{ uri: project.imageUrl }} style={styles.projectImage} />
                    <View style={[styles.projectTypeIcon, { backgroundColor: `${iconColor}20` }]}>
                      <IconComponent size={20} color={iconColor} />
                    </View>
                    {project.distance && (
                      <View style={styles.distanceBadge}>
                        <Text style={styles.distanceBadgeText}>{project.distance}mi</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.projectContent}>
                    <View style={styles.projectHeader}>
                      <View style={styles.projectMeta}>
                        <Text style={styles.projectDate}>
                          {formatDate(project.date)} • {project.time}
                        </Text>
                        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(project.difficulty) }]}>
                          <Text style={styles.difficultyBadgeText}>{project.difficulty}</Text>
                        </View>
                      </View>
                      <Text style={styles.projectOrganizer}>by {project.organizer}</Text>
                    </View>

                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <Text style={styles.projectDescription} numberOfLines={2}>
                      {project.description}
                    </Text>

                    <View style={styles.projectDetails}>
                      <View style={styles.projectDetail}>
                        <MapPin size={14} color="#64748b" />
                        <Text style={styles.projectDetailText}>{project.location}</Text>
                      </View>
                      <View style={styles.projectDetail}>
                        <Clock size={14} color="#64748b" />
                        <Text style={styles.projectDetailText}>{project.duration}</Text>
                      </View>
                      <View style={styles.projectDetail}>
                        <TrendingUp size={14} color="#059669" />
                        <Text style={[styles.projectDetailText, { color: '#059669' }]}>
                          {project.impact}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.projectFooter}>
                      <View style={styles.participantInfo}>
                        <Users size={16} color="#64748b" />
                        <Text style={styles.participantText}>
                          {project.participants}/{project.maxParticipants} joined
                        </Text>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${(project.participants / project.maxParticipants) * 100}%` }
                            ]}
                          />
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.joinButton,
                          project.isJoined && styles.joinButtonJoined,
                          project.participants >= project.maxParticipants && styles.joinButtonFull
                        ]}
                        onPress={() => project.isJoined
                          ? handleLeaveProject(project.id)
                          : handleJoinProject(project.id)
                        }
                        disabled={!project.isJoined && project.participants >= project.maxParticipants}>
                        <Heart
                          size={16}
                          color={project.isJoined ? "#059669" : "#ffffff"}
                          fill={project.isJoined ? "#059669" : "transparent"}
                        />
                        <Text style={[
                          styles.joinButtonText,
                          project.isJoined && styles.joinButtonTextJoined
                        ]}>
                          {project.participants >= project.maxParticipants && !project.isJoined
                            ? 'Full'
                            : project.isJoined
                              ? 'Joined'
                              : 'Join'
                          }
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Community Impact */}
        {communityStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community Impact</Text>
            <View style={styles.impactGrid}>
              <View style={styles.impactCard}>
                <TreePine size={24} color="#059669" />
                <Text style={styles.impactValue}>{communityStats.treesPlanted}</Text>
                <Text style={styles.impactLabel}>Trees Planted</Text>
              </View>
              <View style={styles.impactCard}>
                <Trash2 size={24} color="#0891b2" />
                <Text style={styles.impactValue}>{communityStats.wasteCollected}</Text>
                <Text style={styles.impactLabel}>lbs Waste Cleaned</Text>
              </View>
              <View style={styles.impactCard}>
                <Users size={24} color="#f59e0b" />
                <Text style={styles.impactValue}>{communityStats.activeVolunteers}</Text>
                <Text style={styles.impactLabel}>Active Volunteers</Text>
              </View>
              <View style={styles.impactCard}>
                <TrendingUp size={24} color="#ef4444" />
                <Text style={styles.impactValue}>{communityStats.carbonSaved}</Text>
                <Text style={styles.impactLabel}>lbs CO₂ Saved</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Projects</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFilterModal(false)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>Project Type</Text>
            {filters.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.modalFilterItem,
                    selectedFilter === filter.id && styles.modalFilterItemActive
                  ]}
                  onPress={() => {
                    setSelectedFilter(filter.id);
                    setShowFilterModal(false);
                  }}>
                  <IconComponent size={20} color={selectedFilter === filter.id ? '#1e40af' : '#64748b'} />
                  <Text style={[
                    styles.modalFilterText,
                    selectedFilter === filter.id && styles.modalFilterTextActive
                  ]}>
                    {filter.label}
                  </Text>
                  {selectedFilter === filter.id && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Create Project Modal */}
      <Modal
        visible={showCreateProject}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Project</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCreateProject(false)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Create a new environmental project for your community. Your project will be added to the community feed.
            </Text>

            <View style={styles.createForm}>
              <Text style={styles.formLabel}>Project Title *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter project title..."
                placeholderTextColor="#94a3b8"
                value={newProject.title}
                onChangeText={(text) => setNewProject({ ...newProject, title: text })}
              />

              <Text style={styles.formLabel}>Description *</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Describe your project..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                value={newProject.description}
                onChangeText={(text) => setNewProject({ ...newProject, description: text })}
              />

              <Text style={styles.formLabel}>Location *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter project location..."
                placeholderTextColor="#94a3b8"
                value={newProject.location}
                onChangeText={(text) => setNewProject({ ...newProject, location: text })}
              />

              <Text style={styles.formLabel}>Project Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {filters.slice(1).map((filter) => {
                  const IconComponent = filter.icon;
                  return (
                    <TouchableOpacity
                      key={filter.id}
                      style={[
                        styles.typeOption,
                        newProject.type === filter.id && styles.typeOptionSelected
                      ]}
                      onPress={() => setNewProject({ ...newProject, type: filter.id })}>
                      <IconComponent size={20} color={newProject.type === filter.id ? '#1e40af' : '#64748b'} />
                      <Text style={[
                        styles.typeOptionText,
                        newProject.type === filter.id && styles.typeOptionTextSelected
                      ]}>{filter.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.formLabel}>Date (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                value={newProject.date}
                onChangeText={(text) => setNewProject({ ...newProject, date: text })}
              />

              <Text style={styles.formLabel}>Time (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="10:00 AM"
                placeholderTextColor="#94a3b8"
                value={newProject.time}
                onChangeText={(text) => setNewProject({ ...newProject, time: text })}
              />

              <Text style={styles.formLabel}>Max Participants</Text>
              <TextInput
                style={styles.formInput}
                placeholder="20"
                placeholderTextColor="#94a3b8"
                value={newProject.maxParticipants.toString()}
                onChangeText={(text) => setNewProject({ ...newProject, maxParticipants: parseInt(text) || 20 })}
                keyboardType="numeric"
              />

              <Text style={styles.formLabel}>Impact Goal (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Plant 50 trees, Remove 100 lbs of waste"
                placeholderTextColor="#94a3b8"
                value={newProject.impactGoal}
                onChangeText={(text) => setNewProject({ ...newProject, impactGoal: text })}
              />

              <TouchableOpacity style={styles.createSubmitButton} onPress={handleCreateProjectSubmit}>
                <Text style={styles.createSubmitButtonText}>Create Project</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Leaderboard Modal */}
      <Modal
        visible={showLeaderboard}
        animationType="slide"
        presentationStyle="fullScreen">
        <View style={styles.leaderboardContainer}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.leaderboardTitle}>Community Leaderboard</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLeaderboard(false)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <UserLeaderboard currentUserId={userProfile?.id} />
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
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  leaderboardButton: {
    backgroundColor: '#fffbeb',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  createButton: {
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
  aiRecommendationsCard: {
    backgroundColor: '#fffbeb',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 8,
  },
  aiRecommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 8,
  },
  aiRecommendationText: {
    fontSize: 14,
    color: '#a16207',
    flex: 1,
    lineHeight: 18,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
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
    marginRight: 12,
  },
  filterButton: {
    padding: 4,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterTabActive: {
    backgroundColor: '#1e40af',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 6,
  },
  filterTabTextActive: {
    color: '#ffffff',
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
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  featuredCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  featuredImage: {
    width: '100%',
    height: 160,
  },
  featuredContent: {
    padding: 20,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredStats: {
    gap: 8,
    marginBottom: 16,
  },
  featuredStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredStatText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 6,
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e40af',
    paddingVertical: 14,
    borderRadius: 12,
  },
  featuredButtonJoined: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#059669',
  },
  featuredButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  noProjectsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 40,
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
  noProjectsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  noProjectsText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  projectCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  projectImageContainer: {
    position: 'relative',
  },
  projectImage: {
    width: '100%',
    height: 120,
  },
  projectTypeIcon: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  projectContent: {
    padding: 16,
  },
  projectHeader: {
    marginBottom: 8,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
  },
  projectOrganizer: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  projectDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectDetails: {
    gap: 6,
    marginBottom: 16,
  },
  projectDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectDetailText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 6,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantInfo: {
    flex: 1,
    marginRight: 12,
  },
  participantText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonJoined: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#059669',
  },
  joinButtonFull: {
    backgroundColor: '#e2e8f0',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
  },
  joinButtonTextJoined: {
    color: '#059669',
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
  modalDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  modalFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  modalFilterItemActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  modalFilterText: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 12,
    flex: 1,
  },
  modalFilterTextActive: {
    color: '#1e40af',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1e40af',
  },
  createForm: {
    gap: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeOption: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeOptionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  typeOptionTextSelected: {
    color: '#1e40af',
    fontWeight: '600',
  },
  createSubmitButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  createSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  leaderboardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
});