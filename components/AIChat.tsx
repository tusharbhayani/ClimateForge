import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  Leaf,
  X,
  MapPin,
  Award,
} from 'lucide-react-native';
import { aiService, AIMessage } from '@/services/aiService';
import { useClimate } from '@/contexts/ClimateContext';

interface AIChatProps {
  onClose?: () => void;
}

export default function AIChat({ onClose }: AIChatProps) {
  const { environmentalData, userProfile } = useClimate();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      text: getWelcomeMessage(),
      isUser: false,
      timestamp: new Date(),
      suggestions: getInitialSuggestions()
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickSuggestions = [
    { text: "Air quality tips", icon: Leaf },
    { text: "Local projects", icon: TrendingUp },
    { text: "Level up advice", icon: Lightbulb },
  ];

  function getWelcomeMessage(): string {
    if (!environmentalData || !userProfile) {
      return "Hi! I'm your ClimateGuard AI assistant. I can help you with environmental insights, recommend actions based on your local conditions, and answer questions about climate resilience. What would you like to know?";
    }
    
    const { airQuality, weather, location } = environmentalData;
    const { name, level, actions_completed } = userProfile;
    
    let context = `Hi ${name}! I'm your ClimateGuard AI assistant. As a Level ${level} Eco Warrior with ${actions_completed} actions completed, you're making a real difference! `;
    
    context += `Current conditions in ${location.city}: `;
    
    if (airQuality.aqi > 100) {
      context += `Air quality is ${airQuality.status.toLowerCase()} (AQI: ${airQuality.aqi}) - I can suggest indoor projects or air quality improvement initiatives. `;
    } else {
      context += `Air quality is ${airQuality.status.toLowerCase()} (AQI: ${airQuality.aqi}) - perfect for outdoor environmental activities! `;
    }
    
    if (weather.temperature > 90) {
      context += `It's quite hot at ${weather.temperature}°F - urban cooling projects would be especially impactful. `;
    } else if (weather.temperature < 40) {
      context += `It's cold at ${weather.temperature}°F - great time for energy efficiency projects. `;
    } else {
      context += `Temperature is comfortable at ${weather.temperature}°F. `;
    }
    
    if (weather.uvIndex > 7) {
      context += `UV index is high at ${weather.uvIndex} - consider indoor activities. `;
    }
    
    context += "How can I help you take climate action today?";
    return context;
  }

  function getInitialSuggestions(): string[] {
    if (!environmentalData || !userProfile) {
      return [
        "What's the air quality like today?",
        "How can I reduce my carbon footprint?",
        "Find environmental projects near me"
      ];
    }

    const suggestions = [];
    const { airQuality, weather, risks } = environmentalData;
    const { level, actions_completed } = userProfile;

    // Dynamic suggestions based on conditions and user level
    if (airQuality.aqi > 100) {
      suggestions.push("How can I help improve air quality?");
    } else {
      suggestions.push("What outdoor projects are available?");
    }

    if (weather.temperature > 85) {
      suggestions.push("Find urban cooling projects");
    }

    if (level < 3) {
      suggestions.push("How can I level up faster?");
    } else {
      suggestions.push("What leadership opportunities exist?");
    }

    if (actions_completed < 10) {
      suggestions.push("What's the best project for beginners?");
    } else {
      suggestions.push("How can I mentor other eco-warriors?");
    }

    return suggestions.slice(0, 4);
  }

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Get AI response with enhanced context
      const response = await aiService.sendMessage(
        text.trim(), 
        messages, 
        environmentalData,
        userProfile
      );
      
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Enhanced fallback error message
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm having trouble processing your request right now. However, as a Level ${userProfile?.level || 1} Eco Warrior, I can still help you with environmental insights! Try asking about air quality, weather conditions, or climate action tips for your area.`,
        isUser: false,
        timestamp: new Date(),
        suggestions: ["Check air quality", "Find local projects", "Get climate tips"]
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.botAvatar}>
            <Bot size={24} color="#ffffff" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {environmentalData && userProfile ? 
                `${environmentalData.location.city} • Level ${userProfile.level} • Live data` : 
                'Climate insights & recommendations'
              }
            </Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {/* User Context Bar */}
      {userProfile && environmentalData && (
        <View style={styles.contextBar}>
          <View style={styles.contextItem}>
            <Award size={16} color="#f59e0b" />
            <Text style={styles.contextText}>Level {userProfile.level}</Text>
          </View>
          <View style={styles.contextItem}>
            <MapPin size={16} color="#1e40af" />
            <Text style={styles.contextText}>{environmentalData.location.city}</Text>
          </View>
          <View style={styles.contextItem}>
            <Leaf size={16} color="#059669" />
            <Text style={styles.contextText}>AQI {environmentalData.airQuality.aqi}</Text>
          </View>
        </View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}>
        
        {messages.map((message) => (
          <View key={message.id} style={styles.messageWrapper}>
            <View style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.aiMessage
            ]}>
              <View style={styles.messageHeader}>
                <View style={[
                  styles.messageAvatar,
                  message.isUser ? styles.userAvatar : styles.aiAvatar
                ]}>
                  {message.isUser ? 
                    <User size={16} color="#ffffff" /> : 
                    <Bot size={16} color="#ffffff" />
                  }
                </View>
                <Text style={styles.messageTime}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
              
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.aiMessageText
              ]}>
                {message.text}
              </Text>

              {message.suggestions && (
                <View style={styles.suggestionsContainer}>
                  {message.suggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionButton}
                      onPress={() => handleSendMessage(suggestion)}>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        {isLoading && (
          <View style={styles.messageWrapper}>
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={styles.messageHeader}>
                <View style={[styles.messageAvatar, styles.aiAvatar]}>
                  <Bot size={16} color="#ffffff" />
                </View>
                <Text style={styles.messageTime}>now</Text>
              </View>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#64748b" />
                <Text style={styles.typingText}>AI is analyzing your request...</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Suggestions */}
      <View style={styles.quickSuggestions}>
        {quickSuggestions.map((suggestion, index) => {
          const IconComponent = suggestion.icon;
          return (
            <TouchableOpacity
              key={index}
              style={styles.quickSuggestionButton}
              onPress={() => handleSendMessage(suggestion.text)}
              disabled={isLoading}>
              <IconComponent size={16} color="#1e40af" />
              <Text style={styles.quickSuggestionText}>{suggestion.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder={environmentalData && userProfile ? 
            `Ask about ${environmentalData.location.city}'s conditions or your Level ${userProfile.level} opportunities...` : 
            "Ask about climate actions, air quality, risks..."
          }
          placeholderTextColor="#94a3b8"
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton, 
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#94a3b8" />
          ) : (
            <Send size={20} color={inputText.trim() ? "#ffffff" : "#94a3b8"} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  contextBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 16,
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contextText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  messageContainer: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1e40af',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    backgroundColor: '#3b82f6',
  },
  aiAvatar: {
    backgroundColor: '#059669',
  },
  messageTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#1e293b',
  },
  suggestionsContainer: {
    marginTop: 12,
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  suggestionText: {
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '500',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  quickSuggestions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  quickSuggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickSuggestionText: {
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '500',
    marginLeft: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
});