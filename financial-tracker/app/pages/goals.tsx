// // GoalsListScreen
//
// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, StyleSheet } from 'react-native';
// import { auth } from '../fireconfig';
// import { collection, onSnapshot } from 'firebase/firestore';
//
// export default function GoalsListScreen() {
//     const [goals, setGoals] = useState([]);
//
//     useEffect(() => {
//         const user = auth.currentUser;
//         const unsub = onSnapshot(
//             collection(db, `users/${user.uid}/savingsGoals`),
//             (snapshot) => {
//                 const data = snapshot.docs.map(doc => ({
//                     id: doc.id,
//                     ...doc.data(),
//                 }));
//                 setGoals(data);
//             }
//         );
//         return unsub;
//     }, []);
//
//     const renderItem = ({ item }) => {
//         const progress = item.currentAmount / item.targetAmount * 100;
//         return (
//             <View style={styles.goalCard}>
//                 <Text style={styles.title}>{item.goalName}</Text>
//                 <Text>Saved: ${item.currentAmount} / ${item.targetAmount}</Text>
//                 <Text>Progress: {progress.toFixed(1)}%</Text>
//             </View>
//         );
//     };
//
//     return (
//         <FlatList
//             data={goals}
//             keyExtractor={item => item.id}
//             renderItem={renderItem}
//         />
//     );
// }
//
// const styles = StyleSheet.create({
//     goalCard: { padding: 16, borderBottomWidth: 1 },
//     title: { fontWeight: 'bold' },
// });