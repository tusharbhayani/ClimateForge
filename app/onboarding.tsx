import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, MapPin, Users, Shield, ChevronRight } from 'lucide-react-native';
import { useClimate } from '@/contexts/ClimateContext';

export default function OnboardingScreen() {
  const [userName, setUserName] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { initializeUser, completeOnboarding } = useClimate();

  const steps = [
    {
      title: 'Welcome to ClimateGuard',
      subtitle: 'Your AI-powered climate resilience companion',
      icon: Leaf,
      color: '#059669',
    },
    {
      title: 'Real-time Environmental Data',
      subtitle: 'Monitor air quality, weather, and climate risks in your area',
      icon: MapPin,
      color: '#1e40af',
    },
    {
      title: 'Community Action',
      subtitle: 'Join local environmental initiatives and make a difference',
      icon: Users,
      color: '#f59e0b',
    },
    {
      title: 'AI-Powered Insights',
      subtitle: 'Get personalized recommendations and climate guidance',
      icon: Shield,
      color: '#ef4444',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!userName.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue.');
      return;
    }

    if (isLoading) return; // Prevent double-tap

    try {
      setIsLoading(true);

      // Initialize user in Supabase and update profile
      await initializeUser(userName.trim());

      // Complete onboarding
      await completeOnboarding();

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <LinearGradient
      colors={['#f0f9ff', '#e0f2fe', '#f8fafc']}
      style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
                { backgroundColor: index <= currentStep ? currentStepData.color : '#e2e8f0' }
              ]}
            />
          ))}
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${currentStepData.color}20` }]}>
            <IconComponent size={64} color={currentStepData.color} />
          </View>

          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>

          {/* Name Input (only on last step) */}
          {currentStep === steps.length - 1 && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>What should we call you?</Text>
              <TextInput
                style={styles.textInput}
                value={userName}
                onChangeText={setUserName}
                placeholder="Enter your name"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={50}
                editable={!isLoading}
              />
            </View>
          )}

          {/* Features Preview */}
          {currentStep === 0 && (
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <MapPin size={20} color="#1e40af" />
                <Text style={styles.featureText}>Real-time environmental monitoring</Text>
              </View>
              <View style={styles.featureItem}>
                <Users size={20} color="#059669" />
                <Text style={styles.featureText}>Community-driven climate action</Text>
              </View>
              <View style={styles.featureItem}>
                <Shield size={20} color="#f59e0b" />
                <Text style={styles.featureText}>AI-powered personalized insights</Text>
              </View>
            </View>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentStep(currentStep - 1)}
              disabled={isLoading}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: currentStepData.color },
              currentStep === 0 && styles.nextButtonFull,
              isLoading && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={isLoading}>
            <Text style={styles.nextButtonText}>
              {isLoading ? 'Setting up...' : currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            {!isLoading && <ChevronRight size={20} color="#ffffff" />}
          </TouchableOpacity>
        </View>

        {/* Skip Option */}
        {currentStep < steps.length - 1 && !isLoading && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => setCurrentStep(steps.length - 1)}>
            <Text style={styles.skipButtonText}>Skip to setup</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  progressDotActive: {
    width: 24,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featuresContainer: {
    width: '100%',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#64748b',
    textDecorationLine: 'underline',
  },
});