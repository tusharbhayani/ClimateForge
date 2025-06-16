import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useClimate } from '@/contexts/ClimateContext';
import React from 'react';

export default function IndexScreen() {
  const { isOnboarded, loading } = useClimate();

  useEffect(() => {
    if (!loading) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        if (isOnboarded) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOnboarded, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1e40af" />
      <Text style={styles.loadingText}>Loading ClimateGuard...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
});