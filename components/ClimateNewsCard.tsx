import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Clock, ExternalLink, MapPin, TriangleAlert as AlertTriangle, Info, Zap } from 'lucide-react-native';
import { ClimateNews } from '@/services/climateNewsService';

interface ClimateNewsCardProps {
    news: ClimateNews;
    onPress?: () => void;
}

export default function ClimateNewsCard({ news, onPress }: ClimateNewsCardProps) {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return '#ef4444';
            case 'warning':
                return '#f59e0b';
            case 'info':
            default:
                return '#3b82f6';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return AlertTriangle;
            case 'warning':
                return Zap;
            case 'info':
            default:
                return Info;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'weather_alert':
            case 'safety_alert':
                return '#ef4444';
            case 'local_action':
                return '#059669';
            case 'renewable_energy':
                return '#f59e0b';
            case 'research':
                return '#7c3aed';
            default:
                return '#3b82f6';
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const handleExternalLink = () => {
        if (news.url) {
            Linking.openURL(news.url);
        }
    };

    const SeverityIcon = getSeverityIcon(news.severity);
    const severityColor = getSeverityColor(news.severity);
    const categoryColor = getCategoryColor(news.category);

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.severityIndicator, { backgroundColor: severityColor }]} />

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15` }]}>
                        <Text style={[styles.categoryText, { color: categoryColor }]}>
                            {news.category.replace('_', ' ').toUpperCase()}
                        </Text>
                    </View>

                    <View style={styles.severityContainer}>
                        <SeverityIcon size={16} color={severityColor} />
                    </View>
                </View>

                <Text style={styles.title} numberOfLines={2}>
                    {news.title}
                </Text>

                <Text style={styles.contentText} numberOfLines={3}>
                    {news.content}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.metaInfo}>
                        <View style={styles.metaItem}>
                            <Clock size={12} color="#64748b" />
                            <Text style={styles.metaText}>{formatTimeAgo(news.published_at)}</Text>
                        </View>

                        {news.location && (
                            <View style={styles.metaItem}>
                                <MapPin size={12} color="#64748b" />
                                <Text style={styles.metaText}>{news.location}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.sourceContainer}>
                        <Text style={styles.sourceText}>{news.source}</Text>
                        {news.url && (
                            <TouchableOpacity onPress={handleExternalLink} style={styles.linkButton}>
                                <ExternalLink size={12} color="#1e40af" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    severityIndicator: {
        width: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    severityContainer: {
        padding: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
        lineHeight: 22,
    },
    contentText: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    metaInfo: {
        flex: 1,
        gap: 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sourceText: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '600',
    },
    linkButton: {
        padding: 2,
    },
});