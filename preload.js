const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    sendTransaction: (data) => ipcRenderer.send('add-transaction', data),
    getTransactions: () => ipcRenderer.invoke('get-transactions'),
    deleteTransaction: (id) => ipcRenderer.send('delete-transaction', id),
    onSaveSuccess: (callback) => ipcRenderer.on('transaction-saved', () => callback())
});