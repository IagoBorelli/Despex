// Inicialização de Ícones e Variáveis
lucide.createIcons();
const form = document.getElementById('finance-form');
const listElement = document.getElementById('transaction-list');

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Tornar a função de deletar acessível ao clique no HTML
let itemToDelete = null;
window.deleteItem = (id) => {
    itemToDelete = id;
    const modal = document.getElementById('delete-modal');
    
    // Reset de animação
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
    }, 10);
};

// Fecha o modal
window.closeDeleteModal = () => {
    const modal = document.getElementById('delete-modal');
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        itemToDelete = null;
    }, 300);
};

// Listener para o botão de confirmação dentro do modal
document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    if (itemToDelete) {
        window.api.deleteTransaction(itemToDelete);
        closeDeleteModal();
    }
});
// Carregar Dados e Renderizar Tabela
async function loadDashboard() {
    try {
        const transactions = await window.api.getTransactions();
        let entradas = 0, saidas = 0;
        
        listElement.innerHTML = ''; 

        transactions.forEach(t => {
            const isEntrada = t.tipo === 'entrada';
            if (isEntrada) entradas += t.valor;
            else saidas += t.valor;

            const row = document.createElement('tr');
            row.className = "hover:bg-white/5 transition-colors border-b border-slate/10";
            row.innerHTML = `
                <td class="p-5">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-lg ${isEntrada ? 'bg-brand/10 text-brand' : 'bg-expense/10 text-expense'}">
                            <i data-lucide="${isEntrada ? 'trending-up' : 'trending-down'}" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <p class="font-bold text-sm text-white">${t.descricao}</p>
                            <p class="text-[10px] text-gray-500 uppercase tracking-wider">${t.categoria}</p>
                        </div>
                    </div>
                </td>
                <td class="p-5 text-gray-500 text-sm font-medium">
                    ${t.data.split('-').reverse().join('/')}
                </td>
                <td class="p-5 text-right font-black ${isEntrada ? 'text-brand' : 'text-expense'}">
                    ${isEntrada ? '+' : '-'} ${formatCurrency(t.valor)}
                </td>
                <td class="p-5 text-center">
                    <button onclick="deleteItem(${t.id})" class="text-gray-400 hover:text-expense transition-colors p-2 rounded-lg hover:bg-expense/10" title="Excluir">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            `;
            listElement.appendChild(row);
        });

        // Atualiza KPIs
        document.getElementById('kpi-entrada').innerText = formatCurrency(entradas);
        document.getElementById('kpi-saida').innerText = formatCurrency(saidas);
        document.getElementById('kpi-saldo').innerText = formatCurrency(entradas - saidas);

        // Recriar ícones para as novas linhas
        lucide.createIcons();
    } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
    }
    document.getElementById('desc').focus();
}

// Evento de Envio do Formulário
form.onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        descricao: document.getElementById('desc').value,
        valor: parseFloat(document.getElementById('valor').value),
        tipo: document.getElementById('tipo').value,
        categoria: document.getElementById('categoria').value,
        data: document.getElementById('data').value
    };

    if (!data.descricao || isNaN(data.valor)) return;

    window.api.sendTransaction(data);
    form.reset();
};

// Escutar atualizações do sistema
window.api.onSaveSuccess(() => {
    loadDashboard();
});

// Inicialização
document.addEventListener('DOMContentLoaded', loadDashboard);

window.addEventListener('mouseup', () => {
    if (!document.getElementById('delete-modal').classList.contains('hidden')) return;
    // Se o modal estiver fechado, garante que a UI está ativa
    document.body.style.pointerEvents = 'auto';
});

// Gerenciador de Navegação (Tabs)
const navLinks = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-content');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTabId = link.getAttribute('data-tab');

        // 1. Atualizar visual do Menu (Classe Active)
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // 2. Alternar visibilidade das telas
        tabContents.forEach(content => {
            // Esconde todas as abas
            content.classList.add('hidden');
            
            // Se o ID da div for igual ao data-tab do link, mostra ela
            if (content.id === `tab-${targetTabId}`) {
                content.classList.remove('hidden');
            }
        });

        // 3. Ação específica: Se clicou em Análises, renderiza os gráficos
        if (targetTabId === 'reports') {
            renderCharts();
        }
    });
});