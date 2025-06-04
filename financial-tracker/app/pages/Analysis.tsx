import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { getAuth } from 'firebase/auth';
import { getFirestore, collectionGroup, onSnapshot } from 'firebase/firestore';

type Expense = {
    id: string;
    title: string;
    amount: number;
    date: string;
    category: string;
};

type ChartData = {
    labels: string[];
    expenses: number[];
};

const AnalysisScreen = () => {
    const [timePeriod, setTimePeriod] = useState(0);
    const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const webViewRef = useRef<WebView>(null);
    const periodLabelsConst = ['Daily', 'Weekly', 'Monthly', 'Yearly'] as const;
    type PeriodKey = typeof periodLabelsConst[number];

    const periodLabels: string[] = [...periodLabelsConst];

    const periodTextMap: Record<PeriodKey, string> = {
        Daily: 'day',
        Weekly: 'week',
        Monthly: 'month',
        Yearly: 'year',
    };

    const periodLabel = periodLabels[timePeriod] as PeriodKey;
    const displayPeriod = periodTextMap[periodLabel];


    useEffect(() => {
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;

        if (!user) {
            setLoading(false);
            return;
        }

        const expensesRef = collectionGroup(db, 'expenses');
        const unsubscribe = onSnapshot(expensesRef, (snapshot) => {
            const expenses = snapshot.docs
                .filter(doc => doc.ref.path.includes(user.uid))
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title || 'Untitled',
                        amount: Number(data.amount) || 0,
                        date: data.date || new Date().toISOString(),
                        category: data.category || 'Uncategorized'
                    };
                })
                .filter(expense => expense.amount > 0); // Filter out invalid expenses

            setAllExpenses(expenses);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching expenses:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const groupExpensesByPeriod = () => {
        const now = new Date();

        // Initialize periods
        const periods = {
            daily: Array(7).fill(0),
            weekly: Array(4).fill(0),
            monthly: Array(6).fill(0),
            yearly: Array(4).fill(0),
        };

        allExpenses.forEach(exp => {
            try {
                const expenseDate = new Date(exp.date);

                // Skip invalid dates
                if (isNaN(expenseDate.getTime())) {
                    console.warn('Invalid date for expense:', exp);
                    return;
                }

                const diffTime = now.getTime() - expenseDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                // Daily grouping (last 7 days)
                if (diffDays >= 0 && diffDays < 7) {
                    periods.daily[6 - diffDays] += exp.amount;
                }

                // Weekly grouping (last 4 weeks)
                const diffWeeks = Math.floor(diffDays / 7);
                if (diffWeeks >= 0 && diffWeeks < 4) {
                    periods.weekly[3 - diffWeeks] += exp.amount;
                }

                // Monthly grouping (last 6 months)
                const diffMonths = (now.getFullYear() - expenseDate.getFullYear()) * 12 +
                    (now.getMonth() - expenseDate.getMonth());
                if (diffMonths >= 0 && diffMonths < 6) {
                    periods.monthly[5 - diffMonths] += exp.amount;
                }

                // Yearly grouping (last 4 years)
                const diffYears = now.getFullYear() - expenseDate.getFullYear();
                if (diffYears >= 0 && diffYears < 4) {
                    periods.yearly[3 - diffYears] += exp.amount;
                }
            } catch (error) {
                console.error('Error processing expense date:', exp, error);
            }
        });

        return periods;
    };

    const generateChartData = (): ChartData => {
        const grouped = groupExpensesByPeriod();
        const now = new Date();

        const chartConfigs: ChartData[] = [
            {
                // Daily - last 7 days
                labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'],
                expenses: grouped.daily,
            },
            {
                // Weekly - last 4 weeks
                labels: ['4 weeks ago', '3 weeks ago', '2 weeks ago', 'This week'],
                expenses: grouped.weekly,
            },
            {
                // Monthly - last 6 months
                labels: Array.from({ length: 6 }, (_, i) => {
                    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
                    return date.toLocaleDateString('en-US', { month: 'short' });
                }),
                expenses: grouped.monthly,
            },
            {
                // Yearly - last 4 years
                labels: Array.from({ length: 4 }, (_, i) => (now.getFullYear() - (3 - i)).toString()),
                expenses: grouped.yearly,
            }
        ];

        return chartConfigs[timePeriod];
    };

    const currentData = generateChartData();
    const totalExpenses = currentData.expenses.at(-1) || 0;
    const totalIncome = Math.round(totalExpenses * 1.2); // Placeholder: assume income is 20% more than expenses

    const generateChartHTML = () => {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            html, body { 
              margin: 0; 
              padding: 0; 
              height: 100%; 
              background: white; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .chart-container { 
              width: 100%; 
              height: 100%; 
              padding: 10px;
              box-sizing: border-box;
            }
            canvas { 
              width: 100% !important; 
              height: 100% !important; 
            }
          </style>
        </head>
        <body>
          <div class="chart-container">
            <canvas id="myChart"></canvas>
          </div>
          <script>
            const ctx = document.getElementById('myChart').getContext('2d');
            new Chart(ctx, {
              type: 'bar',
              data: {
                labels: ${JSON.stringify(currentData.labels)},
                datasets: [
                  {
                    label: 'Income',
                    data: ${JSON.stringify(currentData.expenses.map(exp => Math.round(exp * 1.2)))},
                    backgroundColor: 'rgba(46, 204, 113, 0.8)',
                    borderColor: '#2ecc71',
                    borderWidth: 1,
                    borderRadius: 4,
                    barThickness: 20
                  },
                  {
                    label: 'Expenses',
                    data: ${JSON.stringify(currentData.expenses)},
                    backgroundColor: 'rgba(231, 76, 60, 0.8)',
                    borderColor: '#e74c3c',
                    borderWidth: 1,
                    borderRadius: 4,
                    barThickness: 20
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  intersect: false,
                  mode: 'index'
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { 
                      color: 'rgba(0,0,0,0.1)',
                      drawBorder: false
                    },
                    ticks: { 
                      callback: function(value) {
                        return '$' + value.toLocaleString();
                      },
                      color: '#666'
                    }
                  },
                  x: { 
                    grid: { display: false },
                    ticks: { color: '#666' }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { 
                      boxWidth: 12, 
                      padding: 20,
                      color: '#333',
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    callbacks: {
                      label: function(context) {
                        return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                      }
                    }
                  }
                }
              }
            });
          </script>
        </body>
      </html>`;
    };

    useEffect(() => {
        if (webViewRef.current && !loading) {
            webViewRef.current.reload();
        }
    }, [timePeriod, allExpenses, loading]);

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingText}>Loading your expenses...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SegmentedControl
                values={periodLabels}
                selectedIndex={timePeriod}
                onChange={(event) => setTimePeriod(event.nativeEvent.selectedSegmentIndex)}
                style={styles.segmentControl}
            />

            <View style={styles.chartContainer}>
                {allExpenses.length > 0 ? (
                    <WebView
                        ref={webViewRef}
                        originWhitelist={['*']}
                        source={{ html: generateChartHTML() }}
                        style={styles.webview}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                    />
                ) : (
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>No expense data available</Text>
                        <Text style={styles.noDataSubtext}>Add some expenses to see your analysis</Text>
                    </View>
                )}
            </View>

            <View style={styles.whiteSheet} />
            <View style={styles.summaryContainer}>
                <View style={[styles.card, styles.incomeCard]}>
                    <Text style={styles.cardLabel}>Income</Text>
                    <Text style={styles.cardValue}>${totalIncome.toLocaleString()}</Text>
                    <Text style={styles.periodText}>
                        <Text style={styles.periodText}>This {displayPeriod}</Text>
                    </Text>
                </View>

                <View style={[styles.card, styles.expenseCard]}>
                    <Text style={styles.cardLabel}>Expenses</Text>
                    <Text style={styles.cardValue}>
                        ${Math.round(totalExpenses).toLocaleString()}
                    </Text>
                    <Text style={styles.periodText}>
                        <Text style={styles.periodText}>This {displayPeriod}</Text>
                    </Text>
                </View>
            </View>

            {/* Debug info - remove in production */}
            {__DEV__ && (
                <View style={styles.debugContainer}>
                    <Text style={styles.debugText}>
                        Total Expenses Found: {allExpenses.length}
                    </Text>
                    <Text style={styles.debugText}>
                        Period Total: ${Math.round(totalExpenses)}
                    </Text>
                </View>
            )}
        </View>
    );
};

const { height } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#00D09E'
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '500'
    },
    segmentControl: {
        marginBottom: 16,
        marginHorizontal: 16,
        backgroundColor: '#fff'
    },
    chartContainer: {
        height: 320,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    noDataText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#052224',
        marginBottom: 8
    },
    noDataSubtext: {
        fontSize: 14,
        color: '#546e7a',
        textAlign: 'center'
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 60,
    },
    card: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    incomeCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#43a047'
    },
    expenseCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#e53935'
    },
    cardLabel: {
        fontSize: 16,
        color: '#546e7a',
        marginBottom: 4
    },
    cardValue: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e88e5'
    },
    periodText: {
        fontSize: 12,
        color: '#90a4ae',
        marginTop: 4
    },
    whiteSheet: {
        position: 'absolute',
        top: height * 0.50,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F1FFF3',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    debugContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 10,
        borderRadius: 8,
    },
    debugText: {
        fontSize: 12,
        color: '#333',
        marginBottom: 2,
    },
});

export default AnalysisScreen