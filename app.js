        // ডেটা মডেল
        let transactions = [];
        let savingsGoal = { target: null, date: null };
        let currentMonthIndex = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        
        // ক্যাটাগরি তালিকা
        const categories = {
            income: ["বেতন", "ফ্রিল্যান্সিং", "ব্যবসা", "অন্যান্য আয়"],
            expense: ["খাবার", "বাসস্থান", "Transport", "চিকিৎসা", "শিক্ষা", "বিনোদন", "অন্যান্য ব্যয়"],
            savings: ["ডিপিএস", "ব্যাংক জমা", "নগদ জমা", "অন্যান্য জমা"]
        };
        
        // DOM লোড হওয়ার পর ফাংশনগুলো এক্সিকিউট করুন
        document.addEventListener('DOMContentLoaded', function() {
            loadFromLocalStorage();
            initializeUI();
            updateUI();
        });
        
        // UI ইনিশিয়ালাইজেশন
        function initializeUI() {
            // মাস নির্বাচক সেটআপ
            updateMonthDisplay();
            
            // ক্যাটাগরি অপশন লোড করা
            loadCategoryOptions();
            
            // আজকের তারিখ সেট করা
            document.getElementById('transaction-date').valueAsDate = new Date();
            
            // ইভেন্ট লিসেনার যোগ করা
            setupEventListeners();
            
            // লেনদেনের ধরন পরিবর্তন শনাক্ত করা
            document.getElementById('transaction-type').addEventListener('change', function() {
                updateCategoryOptions(this.value);
                toggleTitleField(this.value);
            });
            
            // প্রাথমিকভাবে ক্যাটাগরি অপশন সেট করা
            updateCategoryOptions('income');
            toggleTitleField('income');
        }
        
        // ইভেন্ট লিসেনার সেটআপ
        function setupEventListeners() {
            // ট্যাব নেভিগেশন
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // সক্রিয় ট্যাব আপডেট করুন
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    
                    // ট্যাব কনটেন্ট দেখান
                    const tabId = this.getAttribute('data-tab');
                    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
                    document.getElementById(tabId).classList.add('active');
                });
            });
            
            // মাস নির্বাচন কার্যকারিতা
            document.getElementById('prev-month').addEventListener('click', function() {
                if (currentMonthIndex > 0) {
                    currentMonthIndex--;
                } else {
                    currentMonthIndex = 11;
                    currentYear--;
                }
                updateMonthDisplay();
                updateUI();
            });
            
            document.getElementById('next-month').addEventListener('click', function() {
                if (currentMonthIndex < 11) {
                    currentMonthIndex++;
                } else {
                    currentMonthIndex = 0;
                    currentYear++;
                }
                updateMonthDisplay();
                updateUI();
            });
            
            // নতুন লেনদেন যোগ করুন বাটন
            document.getElementById('add-transaction').addEventListener('click', addTransaction);
            
            // লক্ষ্য নির্ধারণ বাটন
            document.getElementById('set-goal').addEventListener('click', setSavingsGoal);
        }
        
        // লোকাল স্টোরেজ থেকে ডেটা লোড করা
        function loadFromLocalStorage() {
            const savedTransactions = localStorage.getItem('transactions');
            const savedSavingsGoal = localStorage.getItem('savingsGoal');
            
            if (savedTransactions) {
                transactions = JSON.parse(savedTransactions);
            }
            
            if (savedSavingsGoal) {
                savingsGoal = JSON.parse(savedSavingsGoal);
                document.getElementById('savings-target').value = savingsGoal.target;
                document.getElementById('target-date').value = savingsGoal.date;
            }
        }
        
        // লোকাল স্টোরেজে ডেটা সেভ করা
        function saveToLocalStorage() {
            localStorage.setItem('transactions', JSON.stringify(transactions));
            localStorage.setItem('savingsGoal', JSON.stringify(savingsGoal));
        }
        
        // মাস প্রদর্শন আপডেট করা
        function updateMonthDisplay() {
            const monthNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
            document.getElementById('current-month').textContent = `${monthNames[currentMonthIndex]} ${currentYear}`;
        }
        
        // ক্যাটাগরি অপশন লোড করা
        function loadCategoryOptions() {
            const categorySelect = document.getElementById('transaction-category');
            categorySelect.innerHTML = '';
            
            // আয় ক্যাটাগরি যোগ করা
            categories.income.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
        
        // লেনদেনের ধরন অনুযায়ী ক্যাটাগরি অপশন আপডেট করা
        function updateCategoryOptions(type) {
            const categorySelect = document.getElementById('transaction-category');
            categorySelect.innerHTML = '';
            
            const selectedCategories = categories[type] || [];
            
            selectedCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
        
        // লেনদেনের ধরন অনুযায়ী শিরোনাম ফিল্ড দেখানো/লুকানো
        function toggleTitleField(type) {
            const titleField = document.getElementById('title-field');
            if (type === 'income') {
                titleField.style.display = 'none';
            } else {
                titleField.style.display = 'block';
            }
        }
        
        // নতুন লেনদেন যোগ করা
        function addTransaction() {
            const type = document.getElementById('transaction-type').value;
            const title = document.getElementById('transaction-title').value;
            const amount = parseFloat(document.getElementById('transaction-amount').value);
            const category = document.getElementById('transaction-category').value;
            const date = document.getElementById('transaction-date').value;
            
            if (!amount || amount <= 0 || !date) {
                alert('দয়া করে সঠিক তথ্য প্রদান করুন।');
                return;
            }
            
            // শিরোনাম সেট করা
            let transactionTitle = category;
            if (type !== 'income') {
                transactionTitle = title || category;
            }
            
            const transaction = {
                id: Date.now(),
                type,
                title: transactionTitle,
                amount,
                category,
                date,
                month: currentMonthIndex,
                year: currentYear
            };
            
            transactions.push(transaction);
            saveToLocalStorage();
            updateUI();
            
            // ফর্ম রিসেট করুন
            document.getElementById('transaction-title').value = '';
            document.getElementById('transaction-amount').value = '';
            document.getElementById('transaction-date').valueAsDate = new Date();
            
            alert('লেনদেন সফলভাবে যোগ করা হয়েছে!');
        }
        
        // জমার লক্ষ্য নির্ধারণ
        function setSavingsGoal() {
            const target = document.getElementById('savings-target').value;
            const date = document.getElementById('target-date').value;
            
            if (!target || target <= 0 || !date) {
                alert('দয়া করে সঠিক লক্ষ্যমাত্রা এবং তারিখ প্রদান করুন।');
                return;
            }
            
            savingsGoal = {
                target: parseFloat(target),
                date: date
            };
            
            saveToLocalStorage();
            updateUI();
            
            alert('জমার লক্ষ্য সফলভাবে নির্ধারণ করা হয়েছে!');
        }
        
        // লেনদেন মুছুন
        function deleteTransaction(id) {
            if (confirm('আপনি কি নিশ্চিত যে আপনি এই লেনদেনটি মুছতে চান?')) {
                transactions = transactions.filter(transaction => transaction.id !== id);
                saveToLocalStorage();
                updateUI();
            }
        }
        
        // UI আপডেট করা
        function updateUI() {
            updateSummary();
            renderTransactions();
            renderSavingsTable();
            updateCharts();
        }
        
        // সামারি আপডেট করা
        function updateSummary() {
            const currentTransactions = transactions.filter(t => 
                t.month === currentMonthIndex && t.year === currentYear
            );
            
            const totalIncome = currentTransactions
                .filter(t => t.type === 'income')
                .reduce((total, t) => total + t.amount, 0);
                
            const totalExpense = currentTransactions
                .filter(t => t.type === 'expense')
                .reduce((total, t) => total + t.amount, 0);
                
            const totalSavings = currentTransactions
                .filter(t => t.type === 'savings')
                .reduce((total, t) => total + t.amount, 0);
                
            const remaining = totalIncome - totalExpense - totalSavings;
            
            document.getElementById('total-income').textContent = `৳ ${totalIncome.toLocaleString()}`;
            document.getElementById('total-expense').textContent = `৳ ${totalExpense.toLocaleString()}`;
            document.getElementById('total-savings').textContent = `৳ ${totalSavings.toLocaleString()}`;
            document.getElementById('remaining-amount').textContent = `৳ ${remaining.toLocaleString()}`;
            
            // রং আপডেট করা
            document.getElementById('remaining-amount').className = remaining >= 0 ? 'amount positive' : 'amount negative';
        }
        
        // লেনদেন রেন্ডার করা
        function renderTransactions() {
            const tableBody = document.querySelector('#transactions-table tbody');
            const noDataMessage = document.getElementById('no-transactions');
            tableBody.innerHTML = '';
            
            const currentTransactions = transactions
                .filter(t => t.month === currentMonthIndex && t.year === currentYear)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            
            if (currentTransactions.length === 0) {
                noDataMessage.style.display = 'block';
                return;
            }
            
            noDataMessage.style.display = 'none';
            
            currentTransactions.forEach(transaction => {
                const row = document.createElement('tr');
                
                // তারিখ ফরম্যাট করা
                const date = new Date(transaction.date);
                const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                
                // টাইপ অনুযায়ী ক্লাস
                const amountClass = transaction.type === 'income' ? 'positive' : 'negative';
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${transaction.type === 'income' ? 'আয়' : transaction.type === 'expense' ? 'ব্যয়' : 'জমা'}</td>
                    <td>${transaction.title}</td>
                    <td class="${amountClass}">৳ ${transaction.amount.toLocaleString()}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                            <i class="fas fa-trash icon"></i> মুছুন
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        }
        
        // জমার টেবিল রেন্ডার করা
        function renderSavingsTable() {
            const tableBody = document.querySelector('#savings-table tbody');
            const noDataMessage = document.getElementById('no-savings');
            tableBody.innerHTML = '';
            
            // মাসিক জমার ডেটা সংগ্রহ করা
            const monthlySavings = {};
            
            transactions
                .filter(t => t.type === 'savings')
                .forEach(transaction => {
                    const key = `${transaction.month}-${transaction.year}`;
                    if (!monthlySavings[key]) {
                        monthlySavings[key] = 0;
                    }
                    monthlySavings[key] += transaction.amount;
                });
            
            if (Object.keys(monthlySavings).length === 0) {
                noDataMessage.style.display = 'block';
                return;
            }
            
            noDataMessage.style.display = 'none';
            
            const monthNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
            
            Object.keys(monthlySavings).forEach(key => {
                const [month, year] = key.split('-');
                const savingsAmount = monthlySavings[key];
                const targetAmount = savingsGoal.target || 0;
                const status = savingsAmount >= targetAmount ? 'লক্ষ্য অর্জিত' : 'লক্ষ্যের নিচে';
                const statusClass = savingsAmount >= targetAmount ? 'positive' : 'negative';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${monthNames[parseInt(month)]} ${year}</td>
                    <td>৳ ${savingsAmount.toLocaleString()}</td>
                    <td>৳ ${targetAmount.toLocaleString()}</td>
                    <td class="${statusClass}">${status}</td>
                `;
                
                tableBody.appendChild(row);
            });
        }
        
        // চার্ট আপডেট করা
        function updateCharts() {
            // ব্যয় বিশ্লেষণ
            updateExpenseAnalysis();
            
            // মাসিক তুলনা
            updateMonthlyComparison();
            
            // জমার প্রবণতা
            updateSavingsTrend();
        }
        
        // ব্যয় বিশ্লেষণ আপডেট করা
        function updateExpenseAnalysis() {
            const expenseAnalysis = document.getElementById('expense-analysis');
            const currentExpenses = transactions.filter(t => 
                t.type === 'expense' && t.month === currentMonthIndex && t.year === currentYear
            );
            
            if (currentExpenses.length === 0) {
                expenseAnalysis.innerHTML = `
                    <div class="empty-data">
                        <i class="fas fa-chart-pie" style="font-size: 48px; margin-bottom: 15px;"></i>
                        <p>ব্যয়ের ডেটা বিশ্লেষণের জন্য পর্যাপ্ত তথ্য নেই</p>
                    </div>
                `;
                return;
            }
            
            // ক্যাটাগরি অনুযায়ী ব্যয় গণনা করা
            const expensesByCategory = {};
            let totalExpense = 0;
            
            currentExpenses.forEach(expense => {
                if (!expensesByCategory[expense.category]) {
                    expensesByCategory[expense.category] = 0;
                }
                expensesByCategory[expense.category] += expense.amount;
                totalExpense += expense.amount;
            });
            
            // চার্ট তৈরি করা
            let chartHTML = `
                <div class="chart-container">
                    <div class="chart">
                        <h3 class="chart-title">ক্যাটাগরি অনুযায়ী ব্যয়</h3>
                        <div class="chart-content">
            `;
            
            const colors = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f39c12', '#1abc9c', '#d35400'];
            let colorIndex = 0;
            
            Object.keys(expensesByCategory).forEach(category => {
                const percentage = ((expensesByCategory[category] / totalExpense) * 100).toFixed(1);
                chartHTML += `
                    <div class="ratio-bar">
                        <div class="ratio-fill" style="width: ${percentage}%; background: ${colors[colorIndex % colors.length]};"></div>
                        <div class="ratio-text">${category}: ${percentage}%</div>
                    </div>
                `;
                colorIndex++;
            });
            
            chartHTML += `
                        </div>
                    </div>
                    
                    <div class="chart">
                        <h3 class="chart-title">আয়-ব্যয়ের অনুপাত</h3>
                        <div class="chart-content">
            `;
            
            const currentIncome = transactions
                .filter(t => t.type === 'income' && t.month === currentMonthIndex && t.year === currentYear)
                .reduce((total, t) => total + t.amount, 0);
                
            if (currentIncome > 0) {
                const expenseRatio = ((totalExpense / currentIncome) * 100).toFixed(1);
                const savingsRatio = 100 - expenseRatio;
                
                chartHTML += `
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #2c3e50;">${expenseRatio}%</h2>
                        <p>আয়ের তুলনায় ব্যয়</p>
                    </div>
                    <div class="ratio-bar">
                        <div class="ratio-fill" style="width: ${expenseRatio}%; background: #e74c3c;"></div>
                        <div class="ratio-text">ব্যয়: ${expenseRatio}%</div>
                    </div>
                    <div class="ratio-bar">
                        <div class="ratio-fill" style="width: ${savingsRatio}%; background: #2ecc71;"></div>
                        <div class="ratio-text">জমা: ${savingsRatio}%</div>
                    </div>
                `;
            } else {
                chartHTML += `
                    <div class="empty-data">
                        <p>আয়ের ডেটা নেই</p>
                    </div>
                `;
            }
            
            chartHTML += `
                        </div>
                    </div>
                </div>
            `;
            
            expenseAnalysis.innerHTML = chartHTML;
        }
        
        // মাসিক তুলনা আপডেট করা
        function updateMonthlyComparison() {
            const monthComparison = document.getElementById('month-comparison');
            
            // কমপক্ষে ২ মাসের ডেটা প্রয়োজন
            const uniqueMonths = new Set();
            transactions.forEach(t => {
                uniqueMonths.add(`${t.month}-${t.year}`);
            });
            
            if (uniqueMonths.size < 2) {
                monthComparison.innerHTML = `
                    <div class="empty-data">
                        <i class="fas fa-chart-bar" style="font-size: 48px; margin-bottom: 15px;"></i>
                        <p>তুলনা করার জন্য পর্যাপ্ত ডেটা নেই</p>
                    </div>
                `;
                return;
            }
            
            // মাসিক আয় ও ব্যয় গণনা করা
            const monthlyData = {};
            
            transactions.forEach(transaction => {
                const key = `${transaction.month}-${transaction.year}`;
                if (!monthlyData[key]) {
                    monthlyData[key] = { income: 0, expense: 0 };
                }
                
                if (transaction.type === 'income') {
                    monthlyData[key].income += transaction.amount;
                } else if (transaction.type === 'expense') {
                    monthlyData[key].expense += transaction.amount;
                }
            });
            
            // চার্ট তৈরি করা
            let chartHTML = `
                <div class="chart-container">
                    <div class="chart">
                        <h3 class="chart-title">মাসিক আয়ের তুলনা</h3>
                        <div class="chart-content">
            `;
            
            const monthNames = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্ট", "অক্টো", "নভে", "ডিসে"];
            
            Object.keys(monthlyData).forEach(key => {
                const [month, year] = key.split('-');
                const income = monthlyData[key].income;
                
                chartHTML += `
                    <div style="margin: 10px 0; width: 80%;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>${monthNames[parseInt(month)]} ${year}:</span>
                            <span>৳ ${income.toLocaleString()}</span>
                        </div>
                        <div class="ratio-bar">
                            <div class="ratio-fill" style="width: ${(income / Math.max(...Object.values(monthlyData).map(d => d.income)) * 100)}%; background: #2ecc71;"></div>
                        </div>
                    </div>
                `;
            });
            
            chartHTML += `
                        </div>
                    </div>
                    
                    <div class="chart">
                        <h3 class="chart-title">মাসিক ব্যয়ের তুলনা</h3>
                        <div class="chart-content">
            `;
            
            Object.keys(monthlyData).forEach(key => {
                const [month, year] = key.split('-');
                const expense = monthlyData[key].expense;
                
                chartHTML += `
                    <div style="margin: 10px 0; width: 80%;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>${monthNames[parseInt(month)]} ${year}:</span>
                            <span>৳ ${expense.toLocaleString()}</span>
                        </div>
                        <div class="ratio-bar">
                            <div class="ratio-fill" style="width: ${(expense / Math.max(...Object.values(monthlyData).map(d => d.expense)) * 100)}%; background: #e74c3c;"></div>
                        </div>
                    </div>
                `;
            });
            
            chartHTML += `
                        </div>
                    </div>
                </div>
            `;
            
            monthComparison.innerHTML = chartHTML;
        }
        
        // জমার প্রবণতা আপডেট করা
        function updateSavingsTrend() {
            const savingsTrend = document.getElementById('savings-trend');
            
            // জমার ডেটা সংগ্রহ করা
            const monthlySavings = {};
            
            transactions
                .filter(t => t.type === 'savings')
                .forEach(transaction => {
                    const key = `${transaction.month}-${transaction.year}`;
                    if (!monthlySavings[key]) {
                        monthlySavings[key] = 0;
                    }
                    monthlySavings[key] += transaction.amount;
                });
            
            if (Object.keys(monthlySavings).length === 0) {
                savingsTrend.innerHTML = `
                    <div class="empty-data">
                        <i class="fas fa-chart-line" style="font-size: 48px; margin-bottom: 15px;"></i>
                        <p>জমার প্রবণতা দেখানোর জন্য পর্যাপ্ত ডেটা নেই</p>
                    </div>
                `;
                return;
            }
            
            // চার্ট তৈরি করা
            let chartHTML = `
                <div class="chart-content">
                    <h3 style="text-align: center; margin-bottom: 20px; color: #2c3e50;">মাসিক জমার পরিমাণ</h3>
            `;
            
            const monthNames = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্ট", "অক্টো", "নভে", "ডিসে"];
            const sortedMonths = Object.keys(monthlySavings).sort();
            
            sortedMonths.forEach(key => {
                const [month, year] = key.split('-');
                const savings = monthlySavings[key];
                
                chartHTML += `
                    <div style="margin: 15px 0; width: 80%;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>${monthNames[parseInt(month)]} ${year}:</span>
                            <span>৳ ${savings.toLocaleString()}</span>
                        </div>
                        <div class="ratio-bar">
                            <div class="ratio-fill" style="width: ${(savings / Math.max(...Object.values(monthlySavings)) * 100)}%; background: #3498db;"></div>
                        </div>
                    </div>
                `;
            });
            
            chartHTML += `</div>`;
            
            savingsTrend.innerHTML = chartHTML;
        }