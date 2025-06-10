import React from 'react';
// Import testing utilities from React Native Testing Library
import { render, fireEvent, waitFor } from '@testing-library/react-native';
// Import components to be tested
import { GoalForm, GoalProgress, GoalList } from './Goals';
// Import Alert for mocking alert dialogs
import { Alert } from 'react-native';
// ...rest of your code...

// Define props interface for GoalForm (not used in tests, but kept for reference)
interface GoalFormProps {
  userId: string;
}

// Mock Firebase authentication to provide a test user
jest.mock('../../fireconfig', () => ({
  auth: {
    currentUser: { uid: 'test-user-id' }
  }
}));

// Mock Ionicons to avoid Expo font loading errors in tests
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    Ionicons: (props: any) => React.createElement('Icon', props),
  };
});

// Mock React Navigation's useNavigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn()
  })
}));

// Mock Firestore functions used in the components
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
}));

// Test suite for GoalForm component
describe('GoalForm', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test('renders form fields correctly', () => {
    // Render GoalForm and check for input placeholders
    const { getByPlaceholderText } = render(
      <GoalForm userId="test-user-id" />
    );

    expect(getByPlaceholderText('Title')).toBeTruthy();
    expect(getByPlaceholderText('Category')).toBeTruthy();
    expect(getByPlaceholderText('Target Amount')).toBeTruthy();
  });

  test('validates required fields', async () => {
    // Should alert if required fields are missing
    const mockAlert = jest.spyOn(Alert, 'alert');
    const { getByText } = render(
      <GoalForm userId="test-user-id" />
    );

    fireEvent.press(getByText('Add Goal'));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
    });
  });



});
// Test suite for GoalProgress component
describe('GoalProgress', () => {
  // Mock goal object for testing
  const mockGoal = {
    id: '1',
    title: 'Test Goal',
    category: 'Test',
    targetAmount: 1000,
    currentAmount: 500,
    userId: 'test-user-id'
  };

  test('calculates progress percentage correctly', () => {
    // Should display correct progress percentage
    const { getByText } = render(
      <GoalProgress goal={mockGoal} onEdit={() => {}} />
    );

    expect(getByText('$500 of $1000 saved (50.0%)')).toBeTruthy();
  });
});

// Test suite for GoalList component
describe('GoalList', () => {
  test('shows empty state when no goals exist', () => {
    // Should show empty state message if no goals
    const { getByText } = render(
      <GoalList userId="test-user-id" />
    );

    expect(getByText('No goals added yet.')).toBeTruthy();
  });
});