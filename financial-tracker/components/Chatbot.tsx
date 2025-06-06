import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Share,
    UIManager,
    findNodeHandle,
    ActionSheetIOS
} from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { MaterialIcons } from '@expo/vector-icons';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface ChatbotProps {
    onClose?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I\'m your budget assistant. How can I help you today?',
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const viewRef = useRef<View>(null);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Replace this with your actual API call
            const response = await callAIAPI(inputText.trim());

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error calling AI API:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I encountered an error. Please try again later.',
                isUser: false,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    // Replace this function with your actual AI API call
    const callAIAPI = async (message: string): Promise<string> => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful budget and financial assistant. Keep responses focused on budgeting, saving, and financial planning.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 150,
            }),
        });

        const data = await response.json();
        return data.choices[0].message.content;
    };

    const exportConversation = async (format: 'pdf' | 'csv' | 'text') => {
        try {
            let content = '';
            let fileName = '';
            let fileUri = '';

            if (format === 'csv') {
                content = 'Time,Sender,Message\n';
                messages.forEach(msg => {
                    content += `"${msg.timestamp.toLocaleString()}","${msg.isUser ? 'You' : 'Assistant'}","${msg.text.replace(/"/g, '""')}"\n`;
                });
                fileName = `BudgetChat_${new Date().toISOString().slice(0, 10)}.csv`;
                fileUri = `${FileSystem.documentDirectory}${fileName}`;
                await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
            }
            else if (format === 'text') {
                messages.forEach(msg => {
                    content += `${msg.isUser ? 'You' : 'Assistant'} (${msg.timestamp.toLocaleTimeString()}): ${msg.text}\n\n`;
                });
                fileName = `BudgetChat_${new Date().toISOString().slice(0, 10)}.txt`;
                fileUri = `${FileSystem.documentDirectory}${fileName}`;
                await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
            }
            else if (format === 'pdf') {
                let htmlContent = `
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            .header { text-align: center; margin-bottom: 20px; }
                            .message { margin-bottom: 15px; padding: 10px; border-radius: 5px; }
                            .user { background-color: #e3f2fd; margin-left: 20%; margin-right: 5%; }
                            .bot { background-color: #f5f5f5; margin-left: 5%; margin-right: 20%; }
                            .timestamp { font-size: 0.8em; color: #666; }
                            .sender { font-weight: bold; margin-bottom: 5px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>Budget Assistant Conversation</h1>
                            <p>Generated on ${new Date().toLocaleString()}</p>
                        </div>
                `;

                messages.forEach(msg => {
                    htmlContent += `
                        <div class="message ${msg.isUser ? 'user' : 'bot'}">
                            <div class="sender">${msg.isUser ? 'You' : 'Budget Assistant'}</div>
                            <div class="timestamp">${msg.timestamp.toLocaleString()}</div>
                            <div class="text">${msg.text.replace(/\n/g, '<br>')}</div>
                        </div>
                    `;
                });

                htmlContent += `</body></html>`;

                const { uri } = await Print.printToFileAsync({ html: htmlContent });
                fileUri = uri;
                fileName = `BudgetChat_${new Date().toISOString().slice(0, 10)}.pdf`;
            }

            await Sharing.shareAsync(fileUri, {
                dialogTitle: 'Share Conversation',
                mimeType: format === 'pdf' ? 'application/pdf' :
                    format === 'csv' ? 'text/csv' : 'text/plain',
                UTI: format === 'pdf' ? 'com.adobe.pdf' :
                    format === 'csv' ? 'public.comma-separated-values-text' : 'public.plain-text'
            });

        } catch (error) {
            console.error('Error exporting conversation:', error);
            Alert.alert('Error', 'Failed to export conversation. Please try again.');
        }
    };

    const showExportOptions = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Export as PDF', 'Export as CSV', 'Export as Text'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) exportConversation('pdf');
                    if (buttonIndex === 2) exportConversation('csv');
                    if (buttonIndex === 3) exportConversation('text');
                }
            );
        } else {
            // For Android, we'll use a simple Alert for now
            Alert.alert(
                'Export Conversation',
                'Choose export format',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'PDF', onPress: () => exportConversation('pdf') },
                    { text: 'CSV', onPress: () => exportConversation('csv') },
                    { text: 'Text', onPress: () => exportConversation('text') },
                ]
            );
        }
    };

    const renderMessage = (message: Message) => (
        <View
            key={message.id}
            style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.botMessage,
            ]}
        >
            <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.botMessageText,
            ]}>
                {message.text}
            </Text>
            <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Budget Assistant</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity onPress={showExportOptions} style={styles.exportButton}>
                        <MaterialIcons name="file-download" size={24} color="white" />
                    </TouchableOpacity>
                    {onClose && (
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContentContainer}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                <View ref={viewRef}>
                    {messages.map(renderMessage)}
                    {isLoading && (
                        <View style={[styles.messageContainer, styles.botMessage]}>
                            <Text style={styles.loadingText}>Typing...</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Ask me about budgeting..."
                    multiline
                    maxLength={500}
                    editable={!isLoading}
                    onSubmitEditing={sendMessage}
                    returnKeyType="send"
                />
                <TouchableOpacity
                    style={[styles.sendButton, (isLoading || !inputText.trim()) && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={isLoading || !inputText.trim()}
                >
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#2196F3',
        paddingTop: Platform.OS === 'ios' ? 50 : 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    exportButton: {
        marginRight: 15,
    },
    closeButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContentContainer: {
        padding: 16,
    },
    messageContainer: {
        marginVertical: 4,
        padding: 12,
        borderRadius: 16,
        maxWidth: '80%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#2196F3',
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    userMessageText: {
        color: 'white',
    },
    botMessageText: {
        color: '#333',
    },
    timestamp: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        opacity: 0.7,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        alignItems: 'flex-end',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        maxHeight: 100,
        marginRight: 8,
    },
    sendButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default Chatbot;