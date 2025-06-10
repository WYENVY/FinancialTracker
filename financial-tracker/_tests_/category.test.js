import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddExpense from '../app/pages/categories/AddExpense';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Mock dependencies
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    addDoc: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return function MockDateTimePicker({ value, onChange, ...props }) {
        return (
            <View testID="datetime-picker" {...props}>
                <TouchableOpacity
                    testID="mock-date-select"
                    onPress={() => onChange && onChange({}, new Date('2024-01-15T10:30:00Z'))}
                >
                    <Text>Mock Date Picker</Text>
                </TouchableOpacity>
            </View>
        );
    };
});

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('User Story: As a user, I want to assign my expenses to categories...', () => {
    const mockAuth = {
        currentUser: { uid: 'test-user-123' }
    };
    const mockDb = {};
    const mockCollection = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        getAuth.mockReturnValue(mockAuth);
        getFirestore.mockReturnValue(mockDb);
        collection.mockReturnValue(mockCollection);
        addDoc.mockResolvedValue({ id: 'mock-doc-id' });
    });
    
    // Test 1 and 2
    test('should show validation error when required fields are empty', async () => {
        const { getByText } = render(<AddExpense categoryId="Food" />);
        const saveButton = getByText('Save Expense');

        fireEvent.press(saveButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Validation',
                'Please fill in all required fields.'
            );
        });
    });

    test('should show error when user is not logged in', async () => {
        getAuth.mockReturnValue({ currentUser: null });

        const { getByText } = render(<AddExpense categoryId="Food" />);
        const saveButton = getByText('Save Expense');

        fireEvent.press(saveButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                'User not logged in.'
            );
        });
    });

    // Test 3 and 4: Date Picker Functionality
    describe('Date picker should work correctly', () => {
        test('should show date picker when date field is pressed', () => {
            const { getByText, getByTestId } = render(<AddExpense categoryId="Food" />);
            const dateField = getByText('Select Date');

            fireEvent.press(dateField);
            expect(getByTestId('datetime-picker')).toBeTruthy();
        });

        test('should format selected date correctly', async () => {
            const { getByText, getByTestId } = render(<AddExpense categoryId="Food" />);
            const dateField = getByText('Select Date');

            fireEvent.press(dateField);
            
            const mockDateSelect = getByTestId('mock-date-select');
            fireEvent.press(mockDateSelect);

            await waitFor(() => {
                const expectedDate = new Date('2024-01-15T10:30:00Z').toLocaleDateString() + ' • ' +
                    new Date('2024-01-15T10:30:00Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                expect(getByText(expectedDate)).toBeTruthy();
            });
        });
    });

});
