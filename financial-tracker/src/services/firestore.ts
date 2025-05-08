import { addDoc, collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';

// Define transaction type
export type Transaction = {
amount: number;
description: string;
date: Date;
userId: string;
createdAt: Date;
};

// Add transaction record
export const addTransaction = async (transaction: Transaction) => {
try {
    // Convert JavaScript Date object to Firestore Timestamp
    const firestoreTransaction = {
    amount: transaction.amount,
    description: transaction.description,
    userId: transaction.userId,
    date: Timestamp.fromDate(transaction.date),
    createdAt: Timestamp.fromDate(transaction.createdAt)
    };
    const docRef = await addDoc(collection(db, 'transactions'), firestoreTransaction);
    console.log('Transaction added with ID: ', docRef.id);
    return { success: true, id: docRef.id };
} catch (error) {
    console.error('Error adding transaction: ', error);
    return { success: false, error };
}
};

// Get all transaction records for a user
export const getUserTransactions = async (userId: string) => {
try {
    const q = query(collection(db, 'transactions'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const transactions: any[] = [];
    querySnapshot.forEach((doc) => {
    const data = doc.data();
      // Convert Firestore Timestamp back to JavaScript Date
    transactions.push({
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate()
    });
    });
    return transactions;
} catch (error) {
    console.error('Error getting transactions: ', error);
    throw error;
}
};

// Get user budget
export const getUserBudget = async (userId: string) => {
try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
    return userDoc.data().budget || 0;
    } else {
      // If user does not exist, create a new user document
    await addDoc(collection(db, 'users'), {
        id: userId,
        budget: 2000 // Default budget
    });
    return 2000;
    }
} catch (error) {
    console.error('Error getting budget: ', error);
    throw error;
}
};

// Update user budget
export const updateUserBudget = async (userId: string, budget: number) => {
try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
    await updateDoc(userRef, { budget });
    } else {
      // If user does not exist, create a new user document
    await addDoc(collection(db, 'users'), {
        id: userId,
        budget
    });
    }
    return true;
} catch (error) {
    console.error('Error updating budget: ', error);
    throw error;
}
};

// Calculate total spending for the current month
export const getCurrentMonthSpending = async (userId: string) => {
try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(firstDayOfMonth)),
    where('date', '<=', Timestamp.fromDate(lastDayOfMonth))
    );
    const querySnapshot = await getDocs(q);
    let totalSpending = 0;
    querySnapshot.forEach((doc) => {
    totalSpending += doc.data().amount;
    });
    return totalSpending;
} catch (error) {
    console.error('Error calculating spending: ', error);
    throw error;
}
};