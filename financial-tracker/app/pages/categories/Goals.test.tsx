import { createGoal, groupGoalsByCategory, addProgress, Goal } from './goalsManager';

describe('createGoal', () => {
  test('should create a goal with valid fields', () => {
    const goal = createGoal({ title: 'Emergency Fund', targetAmount: 5000, category: 'Emergency' });
    expect(goal).toHaveProperty('title', 'Emergency Fund');
    expect(goal).toHaveProperty('targetAmount', 5000);
    expect(goal).toHaveProperty('category', 'Emergency');
    expect(goal).toHaveProperty('currentAmount', 0);
    expect(goal).toHaveProperty('percentageComplete', 0);
    expect(goal.createdAt).toBeInstanceOf(Date);
  });

  test('should throw error on missing title', () => {
    expect(() => createGoal({ title: '', targetAmount: 5000, category: 'Emergency' })).toThrow(/Title is required/i);
  });

  test('should throw error on invalid targetAmount', () => {
    expect(() => createGoal({ title: 'Emergency Fund', targetAmount: 0, category: 'Emergency' })).toThrow(/Target amount is required/i);
  });

  test('should throw error on missing category', () => {
    expect(() => createGoal({ title: 'Emergency Fund', targetAmount: 5000, category: '' })).toThrow(/Category is required/i);
  });
});

describe('groupGoalsByCategory', () => {
  test('should group goals correctly by category', () => {
    const goals = [
      createGoal({ title: 'Emergency Fund', targetAmount: 5000, category: 'Emergency' }),
      createGoal({ title: 'Trip to Japan', targetAmount: 3000, category: 'Travel' }),
      createGoal({ title: 'Car Repair', targetAmount: 1500, category: 'Emergency' }),
    ];

    const grouped = groupGoalsByCategory(goals);

    expect(Object.keys(grouped)).toHaveLength(2);
    expect(grouped['Emergency']).toHaveLength(2);
    expect(grouped['Travel']).toHaveLength(1);
    expect(grouped['Emergency'][0].title).toBe('Emergency Fund');
    expect(grouped['Emergency'][1].title).toBe('Car Repair');
  });
});

describe('addProgress', () => {
  let goal: Goal;

  beforeEach(() => {
    goal = createGoal({ title: 'Emergency Fund', targetAmount: 5000, category: 'Emergency' });
  });

  test('adds progress correctly when amount is valid', () => {
    const updatedGoal = addProgress(goal, 1000);
    expect(updatedGoal.currentAmount).toBe(1000);
    expect(updatedGoal.percentageComplete).toBeCloseTo(20); // 1000 / 5000 * 100
  });

  test('does not exceed targetAmount when adding progress', () => {
    const updatedGoal = addProgress(goal, 6000);
    expect(updatedGoal.currentAmount).toBe(5000); // capped at targetAmount
    expect(updatedGoal.percentageComplete).toBe(100);
  });

  test('correctly accumulates progress over multiple additions', () => {
    let updatedGoal = addProgress(goal, 1000);
    updatedGoal = addProgress(updatedGoal, 1500);
    expect(updatedGoal.currentAmount).toBe(2500);
    expect(updatedGoal.percentageComplete).toBeCloseTo(50);
  });

  test('throws error if amount is zero or negative', () => {
    expect(() => addProgress(goal, 0)).toThrow(/must be positive/i);
    expect(() => addProgress(goal, -100)).toThrow(/must be positive/i);
  });
});
