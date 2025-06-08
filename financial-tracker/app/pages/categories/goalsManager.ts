export type GoalData = {
  title: string;
  targetAmount: number;
  category: string;
};

export type Goal = GoalData & {
  currentAmount: number;
  createdAt: Date;
  percentageComplete: number;
};

export function createGoal(data: GoalData): Goal {
  if (!data.title || data.title.trim() === '') {
    throw new Error('Title is required');
  }
  if (!data.targetAmount || data.targetAmount <= 0) {
    throw new Error('Target amount is required');
  }
  if (!data.category || data.category.trim() === '') {
    throw new Error('Category is required');
  }

  return {
    ...data,
    currentAmount: 0,
    createdAt: new Date(),
    percentageComplete: 0,
  };
}

export function groupGoalsByCategory(goals: Goal[]): Record<string, Goal[]> {
  return goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = [];
    }
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);
}

export function addProgress(goal: Goal, amount: number): Goal {
  if (amount <= 0) {
    throw new Error('Progress amount must be positive');
  }

  let newAmount = goal.currentAmount + amount;
  if (newAmount > goal.targetAmount) {
    newAmount = goal.targetAmount; // cap at 100%
  }

  const percentageComplete = Math.min((newAmount / goal.targetAmount) * 100, 100);

  return {
    ...goal,
    currentAmount: newAmount,
    percentageComplete: percentageComplete,
  };
}
