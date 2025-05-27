import React from 'react';

type Transaction = {
  id: number;
  description: string;
  amount: number;  // Positive for income, negative for expense
  date: string;    // ISO string or any format
};

type Props = {
  transactions: Transaction[];
};

const RecentTransactions: React.FC<Props> = ({ transactions }) => {
  return (
    <div>
      <h2>Recent Transactions</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {transactions.map(({ id, description, amount, date }) => {
          const isIncome = amount > 0;
          const color = isIncome ? 'green' : 'red';
          const formattedAmount = `${isIncome ? '+' : '-'}$${Math.abs(amount).toFixed(2)}`;
          const formattedDate = new Date(date).toLocaleDateString();

          return (
            <li
              key={id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderBottom: '1px solid #ddd',
                color,
                fontWeight: '600',
              }}
            >
              <span>{description}</span>
              <span>{formattedAmount}</span>
              <span style={{ color: '#666', fontWeight: '400' }}>{formattedDate}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentTransactions;
