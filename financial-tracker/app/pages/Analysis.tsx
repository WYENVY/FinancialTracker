import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const AnalysisScreen = () => {
    const [timePeriod, setTimePeriod] = useState(0);
    const webViewRef = useRef<WebView>(null); // Add proper type here
    const periodLabels = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

    // Test Data
    const dataByPeriod = [
        { // Daily
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            income: [120, 150, 100, 130, 200, 50, 80],
            expenses: [80, 95, 70, 85, 120, 40, 60]
        },
        { // Weekly
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            income: [500, 600, 550, 700],
            expenses: [350, 400, 300, 450]
        },
        { // Monthly
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            income: [1200, 1500, 1100, 1300, 1400, 1600],
            expenses: [800, 950, 700, 850, 900, 1100]
        },
        { // Yearly
            labels: ['2020', '2021', '2022', '2023'],
            income: [15000, 18000, 16000, 20000],
            expenses: [10000, 12000, 11000, 13000]
        }
    ];

    const currentData = dataByPeriod[timePeriod];
    const totalIncome = currentData.income.reduce((sum, val) => sum + val, 0);
    const totalExpenses = currentData.expenses.reduce((sum, val) => sum + val, 0);

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
            }
            .chart-container {
              width: 100%;
              height: 100%;
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
                    data: ${JSON.stringify(currentData.income)},
                    backgroundColor: '#2ecc71',
                    borderRadius: 4,
                    barThickness: 20
                  },
                  {
                    label: 'Expenses',
                    data: ${JSON.stringify(currentData.expenses)},
                    backgroundColor: '#e74c3c',
                    borderRadius: 4,
                    barThickness: 20
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: '#e0e0e0' },
                    ticks: { callback: value => '$' + value }
                  },
                  x: { grid: { display: false } }
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { boxWidth: 12, padding: 20 }
                  }
                }
              }
            });
          </script>
        </body>
      </html>
    `;
    };


    React.useEffect(() => {
        if (webViewRef.current) {
            webViewRef.current.reload();
        }
    }, [timePeriod]);

    return (
        <View style={styles.container}>
            <SegmentedControl
                values={periodLabels}
                selectedIndex={timePeriod}
                onChange={(event) => setTimePeriod(event.nativeEvent.selectedSegmentIndex)}
                style={styles.segmentControl}
            />

            {/* Chart.js via WebView */}
            <View style={styles.chartContainer}>
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: generateChartHTML() }}
                    style={styles.webview}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                />
            </View>

            <View style={styles.whiteSheet} />
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
                <View style={[styles.card, styles.incomeCard]}>
                    <Text style={styles.cardLabel}>Income</Text>
                    <Text style={styles.cardValue}>${totalIncome.toLocaleString()}</Text>
                    <Text style={styles.periodText}>This {periodLabels[timePeriod].toLowerCase()}</Text>
                </View>

                <View style={[styles.card, styles.expenseCard]}>
                    <Text style={styles.cardLabel}>Expenses</Text>
                    <Text style={styles.cardValue}>${totalExpenses.toLocaleString()}</Text>
                    <Text style={styles.periodText}>This {periodLabels[timePeriod].toLowerCase()}</Text>
                </View>
            </View>
        </View>
    );
};

const { height } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#00D09E' // Finova light background
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
        elevation: 2
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent'
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
        elevation: 2
    },
    incomeCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#43a047' // Finova green
    },
    expenseCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#e53935' // Finova red
    },
    cardLabel: {
        fontSize: 16,
        color: '#546e7a', // Finova dark gray
        marginBottom: 4
    },
    cardValue: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e88e5' // Finova primary blue
    },
    periodText: {
        fontSize: 12,
        color: '#90a4ae', // Lighter gray
        marginTop: 4
    },
    whiteSheet: {
        position: 'absolute',
        top: height * 0.50, // Starts 30% down the screen
        bottom: 0,         // Goes to bottom
        left: 0,
        right: 0,
        backgroundColor: '#F1FFF3',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
});


export default AnalysisScreen;