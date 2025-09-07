      // ডেটা মডেল
        let transactions = [];
        let savingsGoal = { target: null, date: null };
        let currentMonthIndex = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        let exportHistory = [];
        
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
            const today = new Date();
            document.getElementById('transaction-date').valueAsDate = today;
            document.getElementById('start-date').valueAsDate = new Date(today.getFullYear(), today.getMonth(), 1);
            document.getElementById('end-date').valueAsDate = today;
            
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
                    
                    // UI আপডেট করুন
                    updateUI();
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
            
            // ডেটা এক্সপোর্ট বাটন
            document.getElementById('export-transactions').addEventListener('click', exportAllTransactions);
            document.getElementById('export-monthly').addEventListener('click', exportMonthlyReport);
            document.getElementById('export-savings').addEventListener('click', exportSavingsReport);
            
            // ডেটা ব্যাকআপ বাটন
            document.getElementById('backup-data').addEventListener('click', backupAllData);
            document.getElementById('restore-data').addEventListener('click', () => document.getElementById('restore-file').click());
            document.getElementById('restore-file').addEventListener('change', restoreDataFromFile);
            
            // কাস্টম রিপোর্ট বাটন
            document.getElementById('generate-custom-report').addEventListener('click', generateCustomReport);
        }
        
        // লোকাল স্টোরেজ থেকে ডেটা লোড করা
        function loadFromLocalStorage() {
            const savedTransactions = localStorage.getItem('transactions');
            const savedSavingsGoal = localStorage.getItem('savingsGoal');
            const savedExportHistory = localStorage.getItem('exportHistory');
            
            if (savedTransactions) {
                transactions = JSON.parse(savedTransactions);
            }
            
            if (savedSavingsGoal) {
                savingsGoal = JSON.parse(savedSavingsGoal);
                document.getElementById('savings-target').value = savingsGoal.target;
                document.getElementById('target-date').value = savingsGoal.date;
            }
            
            if (savedExportHistory) {
                exportHistory = JSON.parse(savedExportHistory);
                updateExportHistoryTable();
            }
        }
        
        // লোকাল স্টোরেজে ডেটা সেভ করা
        function saveToLocalStorage() {
            localStorage.setItem('transactions', JSON.stringify(transactions));
            localStorage.setItem('savingsGoal', JSON.stringify(savingsGoal));
            localStorage.setItem('exportHistory', JSON.stringify(exportHistory));
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
                showNotification('দয়া করে সঠিক তথ্য প্রদান করুন।', true);
                return;
            }
            
            // তারিখ থেকে মাস এবং বছর বের করা
            const transactionDate = new Date(date);
            const transactionMonth = transactionDate.getMonth();
            const transactionYear = transactionDate.getFullYear();
            
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
                month: transactionMonth,
                year: transactionYear
            };
            
            transactions.push(transaction);
            saveToLocalStorage();
            updateUI();
            
            // ফর্ম রিসেট করুন
            document.getElementById('transaction-title').value = '';
            document.getElementById('transaction-amount').value = '';
            document.getElementById('transaction-date').valueAsDate = new Date();
            
            showNotification('লেনদেন সফলভাবে যোগ করা হয়েছে!');
        }
        
        // জমার লক্ষ্য নির্ধারণ
        function setSavingsGoal() {
            const target = document.getElementById('savings-target').value;
            const date = document.getElementById('target-date').value;
            
            if (!target || target <= 0 || !date) {
                showNotification('দয়া করে সঠিক লক্ষ্যমাত্রা এবং তারিখ প্রদান করুন।', true);
                return;
            }
            
            savingsGoal = {
                target: parseFloat(target),
                date: date
            };
            
            saveToLocalStorage();
            updateUI();
            
            showNotification('জমার লক্ষ্য সফলভাবে নির্ধারণ করা হয়েছে!');
        }
        
        // লেনদেন মুছুন
        function deleteTransaction(id) {
            if (confirm('আপনি কি নিশ্চিত যে আপনি এই লেনদেনটি মুছতে চান?')) {
                transactions = transactions.filter(transaction => transaction.id !== id);
                saveToLocalStorage();
                updateUI();
                showNotification('লেনদেন মুছে ফেলা হয়েছে!');
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
                const typeText = transaction.type === 'income' ? 'আয়' : transaction.type === 'expense' ? 'ব্যয়' : 'জমা';
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${typeText}</td>
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
        
        // CSV ফাইল ডাউনলোড ফাংশন
        function downloadCSV(csv, filename) {
            const csvFile = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
            const downloadLink = document.createElement('a');
            const url = URL.createObjectURL(csvFile);
            
            downloadLink.href = url;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // ডাউনলোড ইতিহাসে যোগ করুন
            addToExportHistory(filename, 'CSV');
            
            showNotification('ফাইল ডাউনলোড করা হয়েছে: ' + filename);
        }
        
        // CSV ফরম্যাটে রূপান্তর
        function convertToCSV(data, headers) {
            const headerRow = headers.join(',');
            const rows = data.map(row => 
                Object.values(row).map(value => 
                    typeof value === 'string' && value.includes(',') ? `"${value}"` : value
                ).join(',')
            );
            
            return [headerRow, ...rows].join('\n');
        }
        
        // সমস্ত লেনদেন এক্সপোর্ট
        function exportAllTransactions() {
            if (transactions.length === 0) {
                showNotification('কোনো লেনদেন নেই এক্সপোর্ট করার জন্য', true);
                return;
            }
            
            const headers = ['তারিখ', 'ধরন', 'বিবরণ', 'ক্যাটাগরি', 'পরিমাণ (৳)', 'মাস', 'বছর'];
            const data = transactions.map(t => ({
                তারিখ: t.date,
                ধরন: t.type === 'income' ? 'আয়' : t.type === 'expense' ? 'ব্যয়' : 'জমা',
                বিবরণ: t.title,
                ক্যাটাগরি: t.category,
                'পরিমাণ (৳)': t.amount,
                মাস: t.month + 1,
                বছর: t.year
            }));
            
            const csv = convertToCSV(data, headers);
            const filename = `সমস্ত_লেনদেন_${new Date().toISOString().slice(0, 10)}.csv`;
            downloadCSV(csv, filename);
        }
        
        // মাসিক রিপোর্ট এক্সপোর্ট
        function exportMonthlyReport() {
            const monthNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
            const currentMonthName = monthNames[currentMonthIndex];
            
            const currentTransactions = transactions.filter(t => 
                t.month === currentMonthIndex && t.year === currentYear
            );
            
            if (currentTransactions.length === 0) {
                showNotification(`কোনো লেনদেন নেই ${currentMonthName} মাসের জন্য`, true);
                return;
            }
            
            const headers = ['তারিখ', 'ধরন', 'বিবরণ', 'ক্যাটাগরি', 'পরিমাণ (৳)'];
            const data = currentTransactions.map(t => ({
                তারিখ: t.date,
                ধরন: t.type === 'income' ? 'আয়' : t.type === 'expense' ? 'ব্যয়' : 'জমа',
                বিবরণ: t.title,
                ক্যাটাগরি: t.category,
                'পরিমাণ (৳)': t.amount
            }));
            
            const csv = convertToCSV(data, headers);
            const filename = `${currentMonthName}_${currentYear}_রিপোর্ট.csv`;
            downloadCSV(csv, filename);
        }
        
        // জমার রিপোর্ট এক্সপোর্ট
        function exportSavingsReport() {
            const savingsTransactions = transactions.filter(t => t.type === 'savings');
            
            if (savingsTransactions.length === 0) {
                showNotification('কোনো জমার তথ্য নেই এক্সপোর্ট করার জন্য', true);
                return;
            }
            
            const headers = ['তারিখ', 'বিবরণ', 'ক্যাটাগরি', 'পরিমাণ (৳)', 'মাস', 'বছর'];
            const data = savingsTransactions.map(t => ({
                তারিখ: t.date,
                বিবরণ: t.title,
                ক্যাটাগরি: t.category,
                'পরিমাণ (৳)': t.amount,
                মাস: t.month + 1,
                বছর: t.year
            }));
            
            const csv = convertToCSV(data, headers);
            const filename = `জমার_রিপোর্ট_${new Date().toISOString().slice(0, 10)}.csv`;
            downloadCSV(csv, filename);
        }
        
        // সম্পূর্ণ ডেটা ব্যাকআপ
        function backupAllData() {
            const backupData = {
                transactions: transactions,
                savingsGoal: savingsGoal,
                exportHistory: exportHistory,
                backupDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(backupData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const downloadLink = document.createElement('a');
            const url = URL.createObjectURL(dataBlob);
            
            downloadLink.href = url;
            downloadLink.download = `অর্থ_ব্যবস্থাপনা_ব্যাকআপ_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            showNotification('সম্পূর্ণ ডেটা ব্যাকআপ করা হয়েছে!');
        }
        
        // ডেটা রিস্টোর
        function restoreDataFromFile(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    if (confirm('আপনি কি নিশ্চিত যে আপনি এই ব্যাকআপ থেকে ডেটা রিস্টোর করতে চান? বর্তমান ডেটা ওভাররাইট হবে।')) {
                        transactions = backupData.transactions || [];
                        savingsGoal = backupData.savingsGoal || { target: null, date: null };
                        exportHistory = backupData.exportHistory || [];
                        
                        saveToLocalStorage();
                        updateUI();
                        updateExportHistoryTable();
                        
                        showNotification('ডেটা সফলভাবে রিস্টোর করা হয়েছে!');
                    }
                } catch (error) {
                    showNotification('ফাইল পড়তে সমস্যা হয়েছে। দয়া করে সঠিক JSON ফাইল নির্বাচন করুন।', true);
                    console.error('Error restoring data:', error);
                }
            };
            reader.readAsText(file);
            
            // ফাইল ইনপুট রিসেট
            event.target.value = '';
        }
        
        // কাস্টম রিপোর্ট তৈরি
        function generateCustomReport() {
            const startDate = new Date(document.getElementById('start-date').value);
            const endDate = new Date(document.getElementById('end-date').value);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                showNotification('দয়া করে সঠিক তারিখ নির্বাচন করুন', true);
                return;
            }
            
            if (startDate > endDate) {
                showNotification('শুরুর তারিখ শেষ তারিখের পরে হতে পারে না', true);
                return;
            }
            
            const filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= startDate && transactionDate <= endDate;
            });
            
            if (filteredTransactions.length === 0) {
                showNotification('নির্বাচিত সময়সীমায় কোনো লেনদেন নেই', true);
                return;
            }
            
            const headers = ['তারিখ', 'ধরন', 'বিবরণ', 'ক্যাটাগরি', 'পরিমাণ (৳)'];
            const data = filteredTransactions.map(t => ({
                তারিখ: t.date,
                ধরন: t.type === 'income' ? 'আয়' : t.type === 'expense' ? 'ব্যয়' : 'জমা',
                বিবরণ: t.title,
                ক্যাটাগরি: t.category,
                'পরিমাণ (৳)': t.amount
            }));
            
            const csv = convertToCSV(data, headers);
            const startFormatted = startDate.toISOString().slice(0, 10);
            const endFormatted = endDate.toISOString().slice(0, 10);
            const filename = `কাস্টম_রিপোর্ট_${startFormatted}_থেকে_${endFormatted}.csv`;
            
            downloadCSV(csv, filename);
        }
        
        // ডাউনলোড ইতিহাসে যোগ করুন
        function addToExportHistory(filename, type) {
            exportHistory.unshift({
                date: new Date().toISOString(),
                filename: filename,
                type: type
            });
            
            // সর্বাধিক ২০টি আইটেম রাখুন
            if (exportHistory.length > 20) {
                exportHistory = exportHistory.slice(0, 20);
            }
            
            saveToLocalStorage();
            updateExportHistoryTable();
        }
        
        // ডাউনলোড ইতিহাস টেবিল আপডেট করুন
        function updateExportHistoryTable() {
            const tableBody = document.querySelector('#export-history-table tbody');
            tableBody.innerHTML = '';
            
            if (exportHistory.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">কোনো ডাউনলোড ইতিহাস নেই</td></tr>';
                return;
            }
            
            exportHistory.forEach(item => {
                const date = new Date(item.date);
                const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${item.filename}</td>
                    <td>${item.type}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteExportHistoryItem('${item.date}')">
                            <i class="fas fa-trash icon"></i> মুছুন
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        }
        
        // ডাউনলোড ইতিহাস আইটেম মুছুন
        function deleteExportHistoryItem(dateString) {
            exportHistory = exportHistory.filter(item => item.date !== dateString);
            saveToLocalStorage();
            updateExportHistoryTable();
            showNotification('ইতিহাস আইটেম মুছে ফেলা হয়েছে');
        }
        
        // নোটিফিকেশন দেখানো
        function showNotification(message, isError = false) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = isError ? 'notification error' : 'notification';
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // চার্ট আপডেট করা (সরলীকৃত)
        function updateCharts() {
            // এখানে চার্ট আপডেট করার লজিক থাকবে
            // বিস্তারিত ইমপ্লিমেন্টেশন উপরের কোডের মতো
        }