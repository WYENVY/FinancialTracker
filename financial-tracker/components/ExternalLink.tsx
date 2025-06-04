import React from 'react';
import { Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';

type ExternalLinkProps = {
    href: string;
    children: React.ReactNode;
};

export function ExternalLink({ href, children }: ExternalLinkProps) {
    const handlePress = async () => {
        if (Platform.OS === 'web') {
            window.open(href, '_blank');
        } else {
            await openBrowserAsync(href);
        }
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <Text style={styles.linkText}>
                {children}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    linkText: {
        color: '#1B95E0',
        textDecorationLine: 'underline',
        fontSize: 16,
    },
});
