import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MessageSquare, Send, X } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { ThemeColors } from '../theme/colors';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ visible, onClose }) => {
  const { chatMessages, sendChatMessage, colors } = useApp();
  const [input, setInput] = useState('');
  const styles = getStyles(colors);

  const handleSend = () => {
    if (input.trim()) {
      sendChatMessage(input);
      setInput('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MessageSquare size={20} color={colors.primaryTeal} />
              <Text style={styles.title}>Babcock EazyPay Support</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.messagesList} contentContainerStyle={styles.messagesContent}>
            {chatMessages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.msgBubble,
                  msg.sender === 'User' ? styles.userBubble : styles.agentBubble,
                ]}
              >
                <Text style={styles.senderLabel}>{msg.sender}</Text>
                <Text style={styles.msgText}>{msg.message}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask support a question..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Send size={18} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      height: '75%',
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    messagesList: {
      flex: 1,
      marginVertical: 12,
    },
    messagesContent: {
      gap: 12,
    },
    msgBubble: {
      padding: 12,
      borderRadius: 14,
      maxWidth: '85%',
    },
    userBubble: {
      backgroundColor: colors.primaryBlue,
      alignSelf: 'flex-end',
    },
    agentBubble: {
      backgroundColor: colors.surfaceCard,
      alignSelf: 'flex-start',
    },
    senderLabel: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 10,
      fontWeight: '700',
      marginBottom: 4,
    },
    msgText: {
      color: colors.textPrimary,
      fontSize: 13,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    textInput: {
      flex: 1,
      backgroundColor: colors.surfaceCard,
      color: colors.textPrimary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
    },
    sendButton: {
      backgroundColor: colors.primaryTeal,
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
