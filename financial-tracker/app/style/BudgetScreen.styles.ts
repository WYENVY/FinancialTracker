import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 45,
        backgroundColor: '#000000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#000000',
    },
    budgetCard: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        backgroundColor: '#1a1a1a',
        elevation: 2,
    },
    budgetCardText: {
        color: '#ffffff',
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#76c75f'
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#ffffff',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    progressContainer: {
        height: 20,
        backgroundColor: '#333333',
        borderRadius: 10,
        marginVertical: 8,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBar: {
        height: '100%',
    },
    progressText: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        color: '#ffffff',
    },
    overBudget: {
        color: '#ff6b6b',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 4,
    },
    listContainer: {
        paddingBottom: 20,
    },
    modalContainer: {
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#000000',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#76c75f',
    },
    label: {
        marginBottom: 8,
        fontWeight: '500',
        color: '#ffffff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
    },
    editInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#76c75f',
        marginRight: 10,
    },
    frequencyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 8,
    },
    frequencyButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#333333',
        alignItems: 'center',
    },

    selectedButton: {
        backgroundColor: '#76c75f',
    },
    buttonText: {
        color: '#ffffff',
    },
    selectedText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    addButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#76c75f',
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    editButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    iconPickerContainer: {
        marginVertical: 10,
        backgroundColor: '#333333',
        borderRadius: 8,
        padding: 10,
    },
    editInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    editContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: '#1a1a1a',
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#76c75f',
        marginBottom: 20,
        textAlign: 'center',
    },
});