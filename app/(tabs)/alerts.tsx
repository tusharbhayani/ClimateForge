import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { TriangleAlert as AlertTriangle, Bell, BellOff, Shield, Thermometer, Wind, Droplets, Zap, CircleCheck as CheckCircle, X, Clock, MapPin, Package, Battery, Flashlight, ChevronFirst as FirstAid, CreditCard as Edit, Plus, Phone, Users } from 'lucide-react-native';
import { useClimate } from '@/contexts/ClimateContext';
import { emergencyService, EmergencyContact, EmergencyProtocol } from '@/services/emergencyService';
import EmergencyContactCard from '@/components/EmergencyContactCard';

export default function AlertsScreen() {
  const { alerts, dismissAlert, environmentalData, updateEmergencyKit, emergencyKit, loading, refreshData } = useClimate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [showEditKit, setShowEditKit] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [showProtocols, setShowProtocols] = useState(false);
  const [editingSupply, setEditingSupply] = useState<any>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [relevantProtocols, setRelevantProtocols] = useState<EmergencyProtocol[]>([]);

  useEffect(() => {
    loadEmergencyData();
  }, [environmentalData]);

  const loadEmergencyData = () => {
    // Load emergency contacts based on location
    const location = environmentalData?.location?.city || '';
    const contacts = emergencyService.getEmergencyContacts(location);
    setEmergencyContacts(contacts);

    // Load relevant protocols based on current conditions
    if (environmentalData) {
      const protocols = emergencyService.getRelevantProtocols(environmentalData);
      setRelevantProtocols(protocols);
    }
  };

  const severityFilters = [
    { id: 'all', label: 'All Alerts', color: '#64748b' },
    { id: 'high', label: 'High', color: '#ef4444' },
    { id: 'moderate', label: 'Moderate', color: '#f59e0b' },
    { id: 'low', label: 'Low', color: '#3b82f6' },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'air-quality':
        return Wind;
      case 'weather':
        return Thermometer;
      case 'emergency':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#ef4444';
      case 'moderate':
        return '#f59e0b';
      case 'low':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getSupplyStatus = (item: any) => {
    if (item.expires) {
      const expireDate = new Date(item.expires);
      const now = new Date();
      const daysDiff = Math.floor((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff < 0) return { status: 'expired', color: '#ef4444', text: 'Expired' };
      if (daysDiff < 30) return { status: 'expiring', color: '#f59e0b', text: `Expires in ${daysDiff} days` };
    }

    return item.status === 'complete'
      ? { status: 'complete', color: '#10b981', text: 'Ready' }
      : { status: 'incomplete', color: '#64748b', text: 'Needs attention' };
  };

  const handleUpdateSupply = (supply: any) => {
    setEditingSupply({ ...supply });
    setShowEditKit(true);
  };

  const handleSaveSupply = async () => {
    if (editingSupply) {
      try {
        // Update local state
        const updatedKit = emergencyKit.map(item =>
          item.id === editingSupply.id ? { ...editingSupply } : item
        );

        // Update in context/Supabase
        const success = await updateEmergencyKit(editingSupply.id, editingSupply);

        if (success) {
          setShowEditKit(false);
          setEditingSupply(null);
          Alert.alert('Success', 'Emergency kit item updated successfully!');
        } else {
          Alert.alert('Error', 'Failed to update emergency kit item. Please try again.');
        }
      } catch (error) {
        console.error('Error saving supply:', error);
        Alert.alert('Error', 'Failed to update emergency kit item. Please try again.');
      }
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'evacuation':
        Alert.alert(
          'Evacuation Routes',
          'Your nearest evacuation routes:\n\n1. Highway 101 North\n2. Interstate 280 South\n3. Bay Bridge (if accessible)\n\nAlways follow official emergency guidance.',
          [{ text: 'OK' }]
        );
        break;
      case 'safety':
        Alert.alert(
          'Safety Tips',
          `Current conditions in ${environmentalData?.location?.city || 'your area'}:\n\n• Air Quality: ${environmentalData?.airQuality?.status || 'Unknown'}\n• Temperature: ${environmentalData?.weather?.temperature || 'N/A'}°F\n• UV Index: ${environmentalData?.weather?.uvIndex || 'N/A'}\n\nStay informed and follow local guidance.`,
          [{ text: 'OK' }]
        );
        break;
      case 'contacts':
        setShowEmergencyContacts(true);
        break;
      case 'protocols':
        setShowProtocols(true);
        break;
    }
  };

  // Generate some sample alerts if none exist
  const sampleAlerts = environmentalData ? [
    {
      id: `sample_1_${Date.now()}`,
      type: 'air-quality',
      severity: environmentalData.airQuality.aqi > 100 ? 'moderate' : 'low',
      title: environmentalData.airQuality.aqi > 100 ? 'Air Quality Advisory' : 'Good Air Quality',
      message: environmentalData.airQuality.healthRecommendation,
      timestamp: new Date().toISOString(),
      color: environmentalData.airQuality.color
    },
    {
      id: `sample_2_${Date.now()}`,
      type: 'weather',
      severity: environmentalData.weather.temperature > 90 ? 'high' : environmentalData.weather.temperature > 80 ? 'moderate' : 'low',
      title: environmentalData.weather.temperature > 90 ? 'Heat Warning' : 'Weather Update',
      message: `Current temperature is ${environmentalData.weather.temperature}°F with ${environmentalData.weather.humidity}% humidity. ${environmentalData.weather.description}.`,
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      color: environmentalData.weather.temperature > 90 ? '#ef4444' : environmentalData.weather.temperature > 80 ? '#f59e0b' : '#3b82f6'
    }
  ] : [];

  const filteredAlerts = alerts.length > 0 ? alerts.filter(alert =>
    selectedSeverity === 'all' || alert.severity === selectedSeverity
  ) : sampleAlerts.filter(alert =>
    selectedSeverity === 'all' || alert.severity === selectedSeverity
  );

  const displayAlerts = filteredAlerts;

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshData} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Alerts & Emergency</Text>
          <View style={styles.notificationToggle}>
            <Text style={styles.toggleLabel}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f4f5'}
            />
          </View>
        </View>

        {/* Alert Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Shield size={24} color="#1e40af" />
            <Text style={styles.summaryTitle}>Alert Status</Text>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{displayAlerts.length}</Text>
              <Text style={styles.summaryStatLabel}>Active Alerts</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryStatValue, { color: '#f59e0b' }]}>
                {displayAlerts.filter(a => a.severity === 'moderate').length}
              </Text>
              <Text style={styles.summaryStatLabel}>Moderate</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryStatValue, { color: '#10b981' }]}>
                {displayAlerts.filter(a => a.severity === 'high').length === 0 ? '3' : '0'}
              </Text>
              <Text style={styles.summaryStatLabel}>Systems OK</Text>
            </View>
          </View>
        </View>

        {/* Severity Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}>
          {severityFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.severityFilter,
                { borderColor: filter.color },
                selectedSeverity === filter.id && { backgroundColor: filter.color },
              ]}
              onPress={() => setSelectedSeverity(filter.id)}>
              <Text
                style={[
                  styles.severityFilterText,
                  { color: selectedSeverity === filter.id ? '#ffffff' : filter.color },
                ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          {displayAlerts.length === 0 ? (
            <View style={styles.noAlertsCard}>
              <CheckCircle size={48} color="#10b981" />
              <Text style={styles.noAlertsTitle}>All Clear!</Text>
              <Text style={styles.noAlertsText}>No active alerts for your area.</Text>
            </View>
          ) : (
            displayAlerts.map((alert, index) => {
              const IconComponent = getAlertIcon(alert.type);
              const severityColor = getSeverityColor(alert.severity);

              return (
                <View key={`${alert.id}-${index}`} style={[styles.alertCard, { borderLeftColor: severityColor }]}>
                  <View style={styles.alertHeader}>
                    <View style={styles.alertIconContainer}>
                      <IconComponent size={20} color={severityColor} />
                    </View>
                    <View style={styles.alertMeta}>
                      <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
                        <Text style={styles.severityBadgeText}>
                          {alert.severity.toUpperCase()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.dismissButton}
                        onPress={() => dismissAlert(alert.id)}>
                        <X size={16} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>

                  <View style={styles.alertFooter}>
                    <View style={styles.alertTime}>
                      <Clock size={14} color="#64748b" />
                      <Text style={styles.alertTimeText}>
                        {formatTimestamp(alert.timestamp)}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.viewDetailsButton}>
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Emergency Kit */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Kit</Text>
            <TouchableOpacity
              style={styles.editKitButton}
              onPress={() => setShowEditKit(true)}>
              <Edit size={16} color="#1e40af" />
              <Text style={styles.editKitText}>Edit Kit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.kitOverview}>
            <View style={styles.kitProgress}>
              <Text style={styles.kitProgressText}>
                {emergencyKit.filter(s => s.status === 'complete').length} of {emergencyKit.length} items ready
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(emergencyKit.filter(s => s.status === 'complete').length / emergencyKit.length) * 100}%`
                    }
                  ]}
                />
              </View>
            </View>
          </View>

          {emergencyKit.map((supply, index) => {
            const status = getSupplyStatus(supply);
            let IconComponent;

            switch (supply.item) {
              case 'Water (1 gallon/person/day)':
                IconComponent = Droplets;
                break;
              case 'Non-perishable food (3 days)':
                IconComponent = Package;
                break;
              case 'Battery-powered radio':
                IconComponent = Battery;
                break;
              case 'Flashlight':
                IconComponent = Flashlight;
                break;
              case 'First aid kit':
                IconComponent = FirstAid;
                break;
              case 'Medications':
                IconComponent = Shield;
                break;
              default:
                IconComponent = Package;
            }

            return (
              <View key={`supply-${supply.id}-${index}`} style={styles.supplyItem}>
                <View style={styles.supplyLeft}>
                  <View style={[styles.supplyIcon, { backgroundColor: `${status.color}20` }]}>
                    <IconComponent size={16} color={status.color} />
                  </View>
                  <View style={styles.supplyInfo}>
                    <Text style={styles.supplyName}>{supply.item}</Text>
                    <Text style={[styles.supplyStatus, { color: status.color }]}>
                      {status.text}
                    </Text>
                    <Text style={styles.supplyQuantity}>{supply.quantity}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.supplyAction}
                  onPress={() => handleUpdateSupply(supply)}>
                  <Text style={styles.supplyActionText}>Update</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Resources</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('contacts')}>
              <Phone size={24} color="#ef4444" />
              <Text style={styles.quickActionTitle}>Emergency Contacts</Text>
              <Text style={styles.quickActionDescription}>Call for immediate help</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('protocols')}>
              <Shield size={24} color="#059669" />
              <Text style={styles.quickActionTitle}>Emergency Protocols</Text>
              <Text style={styles.quickActionDescription}>Step-by-step guidance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('evacuation')}>
              <MapPin size={24} color="#1e40af" />
              <Text style={styles.quickActionTitle}>Evacuation Routes</Text>
              <Text style={styles.quickActionDescription}>Know your exit routes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('safety')}>
              <Bell size={24} color="#f59e0b" />
              <Text style={styles.quickActionTitle}>Safety Tips</Text>
              <Text style={styles.quickActionDescription}>Current conditions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Emergency Contacts Modal */}
      <Modal
        visible={showEmergencyContacts}
        animationType="slide"
        presentationStyle="fullScreen">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Emergency Contacts</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEmergencyContacts(false)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Important emergency contacts for your area. Tap any contact to call immediately.
            </Text>
            {emergencyContacts.map((contact) => (
              <EmergencyContactCard key={contact.id} contact={contact} />
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Emergency Protocols Modal */}
      <Modal
        visible={showProtocols}
        animationType="slide"
        presentationStyle="fullScreen">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Emergency Protocols</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowProtocols(false)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Emergency response protocols based on current conditions in your area.
            </Text>
            {relevantProtocols.map((protocol) => (
              <View key={protocol.id} style={styles.protocolCard}>
                <Text style={styles.protocolTitle}>{protocol.title}</Text>
                <View style={[styles.severityBadge, {
                  backgroundColor: getSeverityColor(protocol.severity),
                  alignSelf: 'flex-start',
                  marginBottom: 12
                }]}>
                  <Text style={styles.severityBadgeText}>
                    {protocol.severity.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.protocolStepsTitle}>Emergency Steps:</Text>
                {protocol.steps.map((step, index) => (
                  <Text key={index} style={styles.protocolStep}>
                    {index + 1}. {step}
                  </Text>
                ))}
                {protocol.supplies_needed.length > 0 && (
                  <>
                    <Text style={styles.protocolStepsTitle}>Supplies Needed:</Text>
                    {protocol.supplies_needed.map((supply, index) => (
                      <Text key={index} style={styles.protocolSupply}>
                        • {supply}
                      </Text>
                    ))}
                  </>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Kit Modal */}
      <Modal
        visible={showEditKit}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingSupply ? 'Edit Supply Item' : 'Emergency Kit'}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowEditKit(false);
                setEditingSupply(null);
              }}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {editingSupply ? (
            <View style={styles.editForm}>
              <Text style={styles.editLabel}>Item Name</Text>
              <TextInput
                style={styles.editInput}
                value={editingSupply.item}
                onChangeText={(text) => setEditingSupply({ ...editingSupply, item: text })}
              />

              <Text style={styles.editLabel}>Quantity/Status</Text>
              <TextInput
                style={styles.editInput}
                value={editingSupply.quantity}
                onChangeText={(text) => setEditingSupply({ ...editingSupply, quantity: text })}
              />

              <Text style={styles.editLabel}>Expiration Date (Optional)</Text>
              <TextInput
                style={styles.editInput}
                value={editingSupply.expires || ''}
                onChangeText={(text) => setEditingSupply({ ...editingSupply, expires: text || null })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.editLabel}>Status</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    editingSupply.status === 'complete' && styles.statusButtonActive
                  ]}
                  onPress={() => setEditingSupply({ ...editingSupply, status: 'complete' })}>
                  <Text style={[
                    styles.statusButtonText,
                    editingSupply.status === 'complete' && styles.statusButtonTextActive
                  ]}>Complete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    editingSupply.status === 'incomplete' && styles.statusButtonActive
                  ]}
                  onPress={() => setEditingSupply({ ...editingSupply, status: 'incomplete' })}>
                  <Text style={[
                    styles.statusButtonText,
                    editingSupply.status === 'incomplete' && styles.statusButtonTextActive
                  ]}>Incomplete</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveSupply}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Manage your emergency preparedness kit. Keep these items ready for climate-related emergencies.
              </Text>

              {emergencyKit.map((supply, index) => {
                const status = getSupplyStatus(supply);
                let IconComponent;

                switch (supply.item) {
                  case 'Water (1 gallon/person/day)':
                    IconComponent = Droplets;
                    break;
                  case 'Non-perishable food (3 days)':
                    IconComponent = Package;
                    break;
                  case 'Battery-powered radio':
                    IconComponent = Battery;
                    break;
                  case 'Flashlight':
                    IconComponent = Flashlight;
                    break;
                  case 'First aid kit':
                    IconComponent = FirstAid;
                    break;
                  case 'Medications':
                    IconComponent = Shield;
                    break;
                  default:
                    IconComponent = Package;
                }

                return (
                  <TouchableOpacity
                    key={`modal-supply-${supply.id}-${index}`}
                    style={styles.modalSupplyItem}
                    onPress={() => handleUpdateSupply(supply)}>
                    <View style={styles.supplyLeft}>
                      <View style={[styles.supplyIcon, { backgroundColor: `${status.color}20` }]}>
                        <IconComponent size={16} color={status.color} />
                      </View>
                      <View style={styles.supplyInfo}>
                        <Text style={styles.supplyName}>{supply.item}</Text>
                        <Text style={[styles.supplyStatus, { color: status.color }]}>
                          {status.text}
                        </Text>
                      </View>
                    </View>
                    <Edit size={16} color="#64748b" />
                  </TouchableOpacity>
                );
              })}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
  },
  notificationToggle: {
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  summaryCard: {
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
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  severityFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  severityFilterText: {
    fontSize: 14,
    fontWeight: '600',
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
  editKitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
    gap: 6,
  },
  editKitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  noAlertsCard: {
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
  noAlertsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  noAlertsText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  dismissButton: {
    padding: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTimeText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  viewDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  kitOverview: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kitProgress: {
    marginBottom: 12,
  },
  kitProgressText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  supplyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
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
  supplyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supplyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supplyInfo: {
    flex: 1,
  },
  supplyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  supplyStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  supplyQuantity: {
    fontSize: 11,
    color: '#94a3b8',
  },
  supplyAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  supplyActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionCard: {
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
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
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
  modalSupplyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  protocolCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  protocolTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  protocolStepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 8,
  },
  protocolStep: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  protocolSupply: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 2,
  },
  editForm: {
    padding: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 16,
  },
  editInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#1e40af',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  statusButtonTextActive: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});