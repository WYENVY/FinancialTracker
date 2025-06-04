import type {IoniconsName} from './ionicons';

export type ExpenseCategory = {
    id: string;
    name: string;
    icon: ValidIconName;
    color?: string;
    budget?: number;
    expenses: Expense[];
    isPreset?: boolean;
};

export type Expense = {
    id: string;
    amount: number;
    description: string;
    date: string;
};

export type ValidIconName =
    | 'fast-food'
    | 'car'
    | 'home'
    | 'shirt'
    | 'medical'
    | 'airplane'
    | 'game-controller'
    | 'cart'
    | 'add'
    | 'apps'
    | 'bus'
    | 'receipt'
    | 'basket'
    | 'key'
    | 'gift'
    | 'trending-up'
    | 'musical-notes'
    | 'cash';