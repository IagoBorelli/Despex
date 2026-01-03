const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 850,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('src/index.html');
}

// Salvar
ipcMain.on('add-transaction', (event, data) => {
  const stmt = db.prepare('INSERT INTO transactions (descricao, valor, categoria, tipo, data) VALUES (?, ?, ?, ?, ?)');
  stmt.run(data.descricao, data.valor, data.categoria, data.tipo, data.data);
  event.reply('transaction-saved');
});

// Deletar
ipcMain.on('delete-transaction', (event, id) => {
  try {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    stmt.run(id);
    event.reply('transaction-saved'); 
  } catch (err) {
    console.error("Erro ao deletar:", err);
  }
});
// Buscar
ipcMain.handle('get-transactions', async () => {
  return db.prepare('SELECT * FROM transactions ORDER BY data DESC').all();
});

app.whenReady().then(createWindow);