import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// BudgetAlert component
export type BudgetAlertProps = {
    status: 'normal' | 'warning' | 'exceeded';// status of the budget
    percentageUsed?: number; // percentage of budget used
    onAdjustBudget?: () => void; // function to adjust budget
};

/**
 * status: 'normal' - no warning
 * status: 'warning' - show warning for close to budget limit (yellow)
 * status: 'exceeded' - show warning for exceeded budget (red)
 */

export function BudgetAlert({
    status,
    percentageUsed = 0,
    onAdjustBudget
}: BudgetAlertProps) {
    // If budget status is normal, don't display any alert
    if (status === 'normal') return null;
    
    return (
    <ThemedView
        style={[
        styles.container,
        status === 'warning' ? styles.warningContainer : styles.exceededContainer
        ]}
    >
        <ThemedText style={styles.alertText}>
        {status === 'warning'
            ? `Warning: You've used ${percentageUsed}% of your budget!`
            : 'Alert: You have exceeded your monthly budget!'}
        </ThemedText>
        
        {status === 'exceeded' && onAdjustBudget && (
        <TouchableOpacity
            style={styles.button}
            onPress={onAdjustBudget}
        >
            <ThemedText style={styles.buttonText}>Adjust Budget</ThemedText>
        </TouchableOpacity>
        )}
    </ThemedView>
    );
}

  // Styles
const styles = StyleSheet.create({
    container: {
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 15,
    },
    warningContainer: {
      backgroundColor: '#FFA500', //orange alert background
    },
    exceededContainer: {
      backgroundColor: '#FF3B30', //red alert background
    },
    alertText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    },
    button: {
      backgroundColor: '#1DB954', // green button background
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
    },
    buttonText: {
    fontWeight: 'bold',
      color: '#000000', //black text for button
    },
});