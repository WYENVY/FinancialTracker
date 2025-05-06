import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Custom hook to monitor budget status
export type BudgetStatus = 'normal' | 'warning' | 'exceeded';

// Function to check budget status
export type UseBudgetMonitorResult = {
    budgetStatus: BudgetStatus;        //budget status
    percentageUsed: number;            // percentage of budget used
    handleExceededBudget: () => void;  // function to handle exceeded budget
};

export function useBudgetMonitor(
    currentSpending: number,
    monthlyBudget: number,
    onAdjustBudget?: () => void
): UseBudgetMonitorResult {
    const [budgetStatus, setBudgetStatus] = useState<BudgetStatus>('normal');
    const [percentageUsed, setPercentageUsed] = useState(0);

    // Calculate the budget status and percentage used
    useEffect(() => {
        //avoid division by zero
        if (monthlyBudget <= 0) {
            setBudgetStatus('normal');
            setPercentageUsed(0);
            return;
        }

        // calculate the percentage of budget used
        const percentage = (currentSpending / monthlyBudget) * 100;
        setPercentageUsed(Math.round(percentage));

        //percentage >= 100: exceeded
        //percentage >= 90:warning
        //percentage < 90: normal
        if (percentage >= 100) {
            setBudgetStatus('exceeded');
        } else if (percentage >= 90) {
            setBudgetStatus('warning');
        } else {
            setBudgetStatus('normal');
        }
    }, [currentSpending, monthlyBudget]);

    // Handle budget exceeded alert
    const handleExceededBudget = () => {
        if (budgetStatus === 'exceeded') {
            Alert.alert(
                "budget exceeded",
                "You have exceeded your budget! Would you like to adjust your budget?",
                [
                    {
                        text: "adjust budget",
                        onPress: onAdjustBudget
                    },
                    {
                        text: "i will control my spending",
                        onPress: () => console.log("User will control spending")
                    },
                    {
                        text: "cancel",
                        style: "cancel"
                    }
                ]
            );
        }
    };

    return {
        budgetStatus,
        percentageUsed,
        handleExceededBudget
    };
}