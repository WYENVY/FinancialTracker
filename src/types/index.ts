
export type ExpenseCategory = {
    id: string;
    name: string;
    icon: ValidIconName;
    color: string;
    budget?: number;       // Optional budget amount
    expenses: Expense[];   // Array of expenses
};

export type Expense = {
    id: string;
    amount: number;
    description: string;
    date: string;         // ISO date string
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
    | 'add';


