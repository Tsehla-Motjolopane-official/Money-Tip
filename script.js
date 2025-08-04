// Complete Month Functionality
function completeMonth() {
    const monthInput = document.getElementById("monthSelector");
    if (!monthInput.value) {
        alert("Please select a month first.");
        return;
    }
    // Optionally, you could lock the month or just clear the form for next month
    // Here, we just clear the month input and update views
    monthInput.value = "";
    updateSummary();
    showTransactions();
    updateBudgetProgress();
    alert("Month completed! You can now input data for another month.");
}
// Storing transactions in an array (fixed typo)

let transactions = [];
let nextId = 1;
let budgetGoal = null;
let categories = {
    Income: ["Salary", "Business", "Investments", "Other"],
    Expense: ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Health", "Shopping", "Other"]
};

function getSelectedMonth() {
    const monthInput = document.getElementById("monthSelector").value;
    // Format: YYYY-MM
    return monthInput;
}

function addTransaction() {
    const description = document.getElementById("description").value.trim();
    const amountInput = document.getElementById("amount").value;
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const month = getSelectedMonth();

    if (!month) {
        alert("Please select a month!");
        return;
    }
    if (!description) {
        alert("Please enter a description!");
        return;
    }
    const amount = parseFloat(amountInput);
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount!");
        return;
    }
    if (!category) {
        alert("Please select a category!");
        return;
    }
    const transaction = {
        id: nextId++,
        description,
        amount,
        type,
        category,
        month
    };
    transactions.push(transaction);
    saveData();
    document.getElementById("description").value = '';
    document.getElementById("amount").value = '';
    updateSummary();
    showTransactions();
    updateBudgetProgress();
    updateCompleteMonthBtn();
    showSuccessMessage();
}

function showSuccessMessage() {
    let msg = document.getElementById('transactionSuccessMsg');
    if (!msg) {
        msg = document.createElement('div');
        msg.id = 'transactionSuccessMsg';
        msg.style.position = 'fixed';
        msg.style.top = '20px';
        msg.style.left = '50%';
        msg.style.transform = 'translateX(-50%)';
        msg.style.background = '#6a82fb';
        msg.style.color = '#fff';
        msg.style.padding = '12px 24px';
        msg.style.borderRadius = '8px';
        msg.style.fontWeight = 'bold';
        msg.style.zIndex = '9999';
        document.body.appendChild(msg);
    }
    msg.textContent = 'Transaction added successfully!';
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 1800);
}

function updateSummary() {
    let income = 0;
    let expenses = 0;
    const selectedMonth = getSelectedMonth();
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].month === selectedMonth) {
            if (transactions[i].type === 'Income') {
                income += transactions[i].amount;
            } else {
                expenses += transactions[i].amount;
            }
        }
    }

    // Balance
    const balance = income - expenses;
    console.log(income + "-" + expenses + "=" + balance);

    // Update the display - fixed formatting
    document.getElementById('totalIncome').textContent = "R" + income.toFixed(2);
    document.getElementById('totalExpenses').textContent = "R" + expenses.toFixed(2);

    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = "R" + balance.toFixed(2);

    console.log(balance);

    if (balance < 0) {
        balanceElement.className = "amount balance negative";
    } else {
        balanceElement.className = "amount balance";
    }
}

function showTransactions() {
    const container = document.getElementById('transactionsList');
    const selectedMonth = getSelectedMonth();
    const filtered = transactions.filter(t => t.month === selectedMonth);
    if (!container) return;
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-message"><p>No transactions yet. Add one above!</p></div>';
        return;
    }
    let html = '';
    // Show only the last 3 transactions
    const lastThree = filtered.slice(-3).reverse();
    lastThree.forEach(t => {
        html += `
            <div class="transaction ${t.type}-item">
                <div class="transaction-info">
                    <strong>${t.description}</strong>
                    <small>${t.type} - ${t.category}</small>
                </div>
                <div class="transaction-amount ${t.type}">
                    ${t.type === 'Income' ? '+' : '-'}R${t.amount.toFixed(2)}
                </div>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
            </div>
        `;
    });
    container.innerHTML = html;
}

function deleteTransaction(id) {
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id === id) {
            transactions.splice(i, 1);
            break;
        }
    }
    saveData();
    updateSummary();
    showTransactions();
    updateBudgetProgress();
    updateCompleteMonthBtn();
}


function updateCategoryOptions() {
    const type = document.getElementById("type").value;
    const categorySelect = document.getElementById("category");
    categorySelect.innerHTML = "";
    categories[type].forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

function setBudgetGoal() {
    const goalInput = document.getElementById("budgetGoal").value;
    budgetGoal = parseFloat(goalInput);
    if (!budgetGoal || budgetGoal <= 0) {
        alert("Please enter a valid budget goal!");
        return;
    }
    document.getElementById("budgetProgressContainer").style.display = "block";
    saveData();
    updateBudgetProgress();
}

function updateBudgetProgress() {
    if (!budgetGoal) return;
    let expenses = 0;
    const selectedMonth = getSelectedMonth();
    transactions.forEach(t => {
        if (t.type === "Expense" && t.month === selectedMonth) expenses += t.amount;
    });
    const percent = Math.min((expenses / budgetGoal) * 100, 100);
    document.getElementById("budgetProgress").style.width = percent + "%";
    document.getElementById("budgetProgressText").textContent = `R${expenses.toFixed(2)} / R${budgetGoal.toFixed(2)} (${percent.toFixed(1)}%)`;
    const alertBox = document.getElementById("budgetAlert");
    if (expenses >= budgetGoal) {
        alertBox.textContent = "You have reached or exceeded your budget goal!";
        alertBox.style.display = "block";
    } else if (percent > 80) {
        alertBox.textContent = "Warning: You are close to reaching your budget goal.";
        alertBox.style.display = "block";
    } else {
        alertBox.style.display = "none";
    }
}

function updateCompleteMonthBtn() {
    const btn = document.getElementById('completeMonthBtn');
    if (!btn) return;
    const selectedMonth = getSelectedMonth();
    const hasTx = transactions.some(t => t.month === selectedMonth);
    btn.disabled = !hasTx;
    btn.style.opacity = hasTx ? '1' : '0.5';
    btn.style.cursor = hasTx ? 'pointer' : 'not-allowed';
}


// Local Storage Persistence
function saveData() {
    localStorage.setItem('bt_transactions', JSON.stringify(transactions));
    localStorage.setItem('bt_budgetGoal', budgetGoal);
    localStorage.setItem('bt_nextId', nextId);
}

function loadData() {
    const storedTransactions = localStorage.getItem('bt_transactions');
    const storedBudgetGoal = localStorage.getItem('bt_budgetGoal');
    const storedNextId = localStorage.getItem('bt_nextId');
    if (storedTransactions) transactions = JSON.parse(storedTransactions);
    if (storedBudgetGoal) budgetGoal = parseFloat(storedBudgetGoal);
    if (storedNextId) nextId = parseInt(storedNextId);
}

// PDF Export
function exportToPDF() {
    // Use jsPDF CDN
    if (typeof window.jspdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = generatePDF;
        document.body.appendChild(script);
    } else {
        generatePDF();
    }
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const selectedMonth = getSelectedMonth();
    doc.setFontSize(18);
    doc.text(`Budget Tracker - ${selectedMonth}`, 10, 15);
    doc.setFontSize(12);
    let y = 30;
    doc.text('Description | Type | Category | Amount', 10, y);
    y += 8;
    transactions.filter(t => t.month === selectedMonth).forEach(t => {
        doc.text(`${t.description} | ${t.type} | ${t.category} | R${t.amount.toFixed(2)}`, 10, y);
        y += 8;
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
    });
    doc.save(`BudgetTracker_${selectedMonth}.pdf`);
}

window.onload = function() {
    loadData();
    // Budget goal mandatory modal
    if (!budgetGoal || budgetGoal <= 0) {
        document.getElementById('goalModal').style.display = 'flex';
        // Hide all main content except modal
        document.querySelectorAll('.container, body > div:not(#goalModal)').forEach(e => {
            if (e.id !== 'goalModal') e.style.display = 'none';
        });
        return;
    }
    updateCategoryOptions();
    // Set default month to current month
    const monthInput = document.getElementById("monthSelector");
    if (monthInput) {
        const now = new Date();
        monthInput.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        monthInput.addEventListener('change', function() {
            updateSummary();
            showTransactions();
            updateBudgetProgress();
            updateCompleteMonthBtn();
        });
    }
    updateSummary();
    showTransactions();
    if (budgetGoal) {
        document.getElementById("budgetProgressContainer").style.display = "block";
        document.getElementById("budgetGoal").value = budgetGoal;
    }
    updateBudgetProgress();
    updateCompleteMonthBtn();
};

// Monthly Reports & Comparison
function showMonthlyReports() {
    // Get all months with data
    const months = Array.from(new Set(transactions.map(t => t.month))).sort();
    if (months.length < 2) {
        alert('You need at least 2 months of data to view reports.');
        return;
    }
    // Create modal
    let modal = document.getElementById('monthlyReportModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'monthlyReportModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.innerHTML = `<div style="background:white;max-width:600px;width:90%;padding:30px;border-radius:10px;position:relative;">
            <button id="closeReportModal" style="position:absolute;top:10px;right:10px;font-size:1.5em;">&times;</button>
            <h2>Monthly Summary Reports</h2>
            <div id="reportMonthSelect"></div>
            <div id="reportContent"></div>
        </div>`;
        document.body.appendChild(modal);
        document.getElementById('closeReportModal').onclick = () => { modal.remove(); };
    } else {
        modal.style.display = 'flex';
    }
    // Month range selector
    const selectDiv = modal.querySelector('#reportMonthSelect');
    selectDiv.innerHTML = `<label>Compare: <select id="compareRange">
        <option value="1">Last Month</option>
        <option value="3">Last 3 Months</option>
        <option value="6">Last 6 Months</option>
        <option value="12">Last 12 Months</option>
        <option value="${months.length}">All Months</option>
    </select></label>
    <label style="margin-left:20px;">Select Month: <select id="reportMonth">
        ${months.map(m => `<option value="${m}">${m}</option>`).join('')}
    </select></label>`;
    // Initial report
    function renderReport() {
        const range = parseInt(document.getElementById('compareRange').value);
        const selected = document.getElementById('reportMonth').value;
        const idx = months.indexOf(selected);
        const compareMonths = months.slice(Math.max(0, idx-range), idx+1);
        let html = '';
        compareMonths.forEach((m, i) => {
            const monthTx = transactions.filter(t => t.month === m);
            const income = monthTx.filter(t => t.type === 'Income').reduce((a,b)=>a+b.amount,0);
            const expense = monthTx.filter(t => t.type === 'Expense').reduce((a,b)=>a+b.amount,0);
            html += `<div style="margin-bottom:15px;"><strong>${m}</strong>: Income: R${income.toFixed(2)}, Expenses: R${expense.toFixed(2)}, Balance: R${(income-expense).toFixed(2)}</div>`;
            // Comparison
            if (i > 0) {
                const prevIncome = compareMonths[i-1] ? transactions.filter(t => t.month === compareMonths[i-1] && t.type === 'Income').reduce((a,b)=>a+b.amount,0) : 0;
                const prevExpense = compareMonths[i-1] ? transactions.filter(t => t.month === compareMonths[i-1] && t.type === 'Expense').reduce((a,b)=>a+b.amount,0) : 0;
                const incomeDiff = income - prevIncome;
                const expenseDiff = expense - prevExpense;
                html += `<div style="margin-bottom:10px;">Compared to previous: Income: <span style="color:${incomeDiff>=0?'#4caf50':'#f44336'}">${incomeDiff>=0?'+':''}${incomeDiff.toFixed(2)}</span>, Expenses: <span style="color:${expenseDiff<=0?'#4caf50':'#f44336'}">${expenseDiff<=0?'+':''}${expenseDiff.toFixed(2)}</span></div>`;
            }
        });
        modal.querySelector('#reportContent').innerHTML = html;
    }
    selectDiv.querySelector('#compareRange').onchange = renderReport;
    selectDiv.querySelector('#reportMonth').onchange = renderReport;
    renderReport();
}