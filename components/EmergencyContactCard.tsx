import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Phone, Clock, MapPin, Shield, Zap, Users, Truck } from 'lucide-react-native';
import { EmergencyContact } from '@/services/emergencyService';

interface EmergencyContactCardProps {
    contact: EmergencyContact;
    onPress?: () => void;
}

export default function EmergencyContactCard({ contact, onPress }: EmergencyContactCardProps) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'emergency':
                return Shield;
            case 'medical':
                return Zap;
            case 'fire':
                return Zap;
            case 'police':
                return Shield;
            case 'utility':
                return Truck;
            case 'family':
                return Users;
            default:
                return Phone;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'emergency':
                return '#ef4444';
            case 'medical':
                return '#f59e0b';
            case 'fire':
                return '#dc2626';
            case 'police':
                return '#1e40af';
            case 'utility':
                return '#059669';
            case 'family':
                return '#7c3aed';
            default:
                return '#64748b';
        }
    };

    const handleCall = () => {
        const phoneNumber = contact.phone.replace(/[^\d+]/g, '');

        Alert.alert(
            'Call Emergency Contact',
            `Call ${contact.name} at ${contact.phone}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call',
                    onPress: () => {
                        Linking.openURL(`tel:${phoneNumber}`).catch(err => {
                            console.error('Error making phone call:', err);
                            Alert.alert('Error', 'Unable to make phone call');
                        });
                    }
                }
            ]
        );
    };

    const IconComponent = getTypeIcon(contact.type);
    const typeColor = getTypeColor(contact.type);

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress || handleCall}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${typeColor}20` }]}>
                    <IconComponent size={20} color={typeColor} />
                </View>

                <View style={styles.availabilityContainer}>
                    <Clock size={14} color={contact.available24h ? '#059669' : '#f59e0b'} />
                    <Text style={[
                        styles.availabilityText,
                        { color: contact.available24h ? '#059669' : '#f59e0b' }
                    ]}>
                        {contact.available24h ? '24/7' : 'Business Hours'}
                    </Text>
                </View>
            </View>

            <Text style={styles.name}>{contact.name}</Text>

            {contact.description && (
                <Text style={styles.description}>{contact.description}</Text>
            )}

            <View style={styles.contactInfo}>
                <View style={styles.phoneContainer}>
                    <Phone size={16} color="#1e40af" />
                    <Text style={styles.phoneText}>{contact.phone}</Text>
                </View>

                {contact.location && (
                    <View style={styles.locationContainer}>
                        <MapPin size={14} color="#64748b" />
                        <Text style={styles.locationText}>{contact.location}</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                <Phone size={16} color="#ffffff" />
                <Text style={styles.callButtonText}>Call Now</Text>
            </TouchableOpacity>
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
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    availabilityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    availabilityText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 12,
    },
    contactInfo: {
        marginBottom: 16,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    phoneText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e40af',
        marginLeft: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 13,
        color: '#64748b',
        marginLeft: 6,
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ef4444',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    callButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
});