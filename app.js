// ডেটা মডেল
let transactions = [];
let savingsGoal = { target: null, date: null };
let currentMonthIndex = new Date().getMonth();
let currentYear = new Date().getFullYear();
let isDemoMode = false;

// ক্যাটাগরি তালিকা
const categories = {
    income: ["বেতন", "ফ্রিল্যান্সিং", "ব্যবসা", "অন্যান্য আয়"],
    expense: ["খাবার", "বাসস্থান", "Transport", "চিকিৎসা", "শিক্ষা", "বিনোদন", "অন্যান্য ব্যয়"],
    savings: ["ডিপিএস", "ব্যাংক জমা", "নগদ জমা", "অন্যান্য জমা"]
};

// DOM লোড হওয়ার পর ফাংশনগুলো এক্সিকিউট করুন
document.addEventListener('DOMContentLoaded', function() {
    // লগইন বাটন ইভেন্ট যোগ করুন
    document.getElementById('google-login').addEventListener('click', handleGoogleLogin);
    
    // ডেমো লগইন বাটন ইভেন্ট যোগ করুন
    document.getElementById('demo-login').addEventListener('click', handleDemoLogin);
    
    // লোকাল স্টোরেজ থেকে ডেটা লোড করুন (ডেমো মোডের জন্য)
    loadFromLocalStorage();
});

// গুগল লগইন প্রক্রিয়া
function handleGoogleLogin() {
    // ফিডব্যাক দেখান
    const feedback = document.getElementById('login-feedback');
    feedback.textContent = "গুগল লগইন প্রক্রিয়া শুরু হচ্ছে...";
    feedback.className = "login-feedback";
    feedback.classList.remove("hidden");
    
    // স্পিনার দেখান
    document.getElementById('login-spinner').classList.remove("hidden");
    
    // লগইন বাটন নিষ্ক্রিয় করুন
    document.getElementById('google-login').disabled = true;
    document.getElementById('demo-login').disabled = true;
    
    // গুগল লগইন সিমুলেট করুন (বাস্তবে এখানে গুগল OAuth API কল হবে)
    simulateGoogleLogin()
        .then(() => {
            // সফল লগইন
            feedback.textContent = "সফলভাবে লগইন করা হয়েছে! অ্যাপ্লিকেশন লোড হচ্ছে...";
            feedback.classList.add("success");
            
            // গুগল API ইনিশিয়ালাইজ করুন
            initGoogleAuth();
        })
        .catch((error) => {
            // লগইন ত্রুটি
            feedback.textContent = "লগইনে সমস্যা হয়েছে: " + error;
            feedback.classList.add("error");
            
            // স্পিনার লুকান
            document.getElementById('login-spinner').classList.add("hidden");
            
            // লগইন বাটন সক্রিয় করুন
            document.getElementById('google-login').disabled = false;
            document.getElementById('demo-login').disabled = false;
        });
}

// ডেমো লগইন প্রক্রিয়া
function handleDemoLogin() {
    // ফিডব্যাক দেখান
    const feedback = document.getElementById('login-feedback');
    feedback.textContent = "ডেমো মোড শুরু হচ্ছে...";
    feedback.className = "login-feedback";
    feedback.classList.remove("hidden");
    
    // স্পিনার দেখান
    document.getElementById('login-spinner').classList.remove("hidden");
    
    // লগইন বাটন নিষ্ক্রিয় করুন
    document.getElementById('demo-login').disabled = true;
    document.getElementById('google-login').disabled = true;
    
    // ডেমো মোড সেট করুন
    isDemoMode = true;
    
    // ডেমো লগইন সিমুলেট করুন
    simulateDemoLogin()
        .then(() => {
            // সফল লগইন
            feedback.textContent = "ডেমো মোড শুরু হয়েছে! স্থানীয় স্টোরেজে ডেটা সংরক্ষণ করা হবে।";
            feedback.classList.add("success");
            
            // 2 সেকেন্ড পর মূল অ্যাপ্লিকেশন দেখান
            setTimeout(() => {
                showMainApp();
                
                // স্পিনার লুকান
                document.getElementById('login-spinner').classList.add("hidden");
                
                // লগইন বাটন সক্রিয় করুন
                document.getElementById('demo-login').disabled = false;
                document.getElementById('google-login').disabled = false;
            }, 2000);
        })
        .catch((error) => {
            // লগইন ত্রুটি
            feedback.textContent = "ডেমো মোড শুরু করতে সমস্যা: " + error;
            feedback.classList.add("error");
            
            // স্পিনার লুকান
            document.getElementById('login-spinner').classList.add("hidden");
            
            // লগইন বাটন সক্রিয় করুন
            document.getElementById('demo-login').disabled = false;
            document.getElementById('google-login').disabled = false;
        });
}

// গুগল লগইন সিমুলেশন (বাস্তবে গুগল OAuth API ব্যবহার করুন)
function simulateGoogleLogin() {
    return new Promise((resolve, reject) => {
        // 2 সেকেন্ড ডিলে সিমুলেট করুন
        setTimeout(() => {
            // 80% সাফল্যের হার সিমুলেট করুন
            if (Math.random() > 0.2) {
                resolve("সফল");
            } else {
                reject("নেটওয়ার্ক ত্রুটি বা ব্যবহারকারী বাতিল করেছেন");
            }
        }, 2000);
    });
}

// ডেমো লগইন সিমুলেশন
function simulateDemoLogin() {
    return new Promise((resolve) => {
        // 1.5 সেকেন্ড ডিলে সিমুলেট করুন
        setTimeout(() => {
            resolve("সফল");
        }, 1500);
    });
}

// গুগল API ইনিশিয়ালাইজেশন
function initGoogleAuth() {
    // গুগল API লোড হয়েছে কিনা চেক করুন
    if (typeof gapi === 'undefined') {
        showNotification('গুগল API লোড হয়নি। পরে আবার চেষ্টা করুন।', true);
        return;
    }
    
    gapi.load('auth2', function() {
        gapi.auth2.init({
            client_id: 'YOUR_GOOGLE_CLIENT_ID', // এখানে আপনার ক্লায়েন্ট আইডি দিন
            scope: 'profile email https://www.googleapis.com/auth/drive.file'
        }).then(function() {
            console.log('Google Auth initialized');
            
            // বাস্তব গুগল লগইন করুন
            handleRealGoogleLogin();
        }).catch(function(error) {
            console.error('Google Auth initialization failed:', error);
            showNotification('গুগল লগইন সেটআপ失败। পরে আবার চেষ্টা করুন।', true);
        });
    });
}

// বাস্তব গুগল লগইন ফাংশন
function handleRealGoogleLogin() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(function(googleUser) {
        // সফল লগইন
        const profile = googleUser.getBasicProfile();
        console.log('Logged in as: ' + profile.getName());
        
        // ব্যবহারকারীর তথ্য প্রদর্শন
        document.getElementById('user-avatar').src = profile.getImageUrl();
        document.getElementById('user-name').textContent = profile.getName();
        
        // গুগল ড্রাইভ থেকে ডেটা লোড করুন
        loadDataFromGoogleDrive().then(() => {
            // মূল অ্যাপ্লিকেশন দেখান
            showMainApp();
            
            // স্পিনার লুকান
            document.getElementById('login-spinner').classList.add("hidden");
            
            // ফিডব্যাক আপডেট করুন
            const feedback = document.getElementById('login-feedback');
            feedback.textContent = "গুগল ড্রাইভ থেকে ডেটা লোড করা হয়েছে!";
            feedback.classList.add("success");
        });
        
    }).catch(function(error) {
        // লগইন失败
        console.error('Login failed: ', error);
        
        // স্পিনার লুকান
        document.getElementById('login-spinner').classList.add("hidden");
        
        // ফিডব্যাক আপডেট করুন
        const feedback = document.getElementById('login-feedback');
        feedback.textContent = "লগইন失败: " + error;
        feedback.classList.add("error");
        
        // লগইন বাটন সক্রিয় করুন
        document.getElementById('google-login').disabled = false;
        document.getElementById('demo-login').disabled = false;
    });
}

// গুগল ড্রাইভ থেকে ডেটা লোড করা
async function loadDataFromGoogleDrive() {
    try {
        // ড্রাইভে ফাইল খুঁজুন
        const response = await gapi.client.drive.files.list({
            q: "name='money_management_data.json' and trashed=false",
            fields: 'files(id, name, modifiedTime)'
        });
        
        const files = response.result.files;
        if (files.length > 0) {
            // ফাইল পাওয়া গেছে, ডেটা লোড করুন
            const fileId = files[0].id;
            const fileResponse = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });
            
            const data = fileResponse.body;
            transactions = data.transactions || [];
            savingsGoal = data.savingsGoal || { target: null, date: null };
            
            // শেষ সিঙ্ক সময় আপডেট করুন
            document.getElementById('last-sync-time').textContent = new Date().toLocaleString();
            document.getElementById('drive-file-name').textContent = files[0].name;
            
            showNotification('গুগল ড্রাইভ থেকে ডেটা লোড করা হয়েছে!');
        } else {
            // নতুন ফাইল তৈরি করুন
            await saveDataToGoogleDrive();
            showNotification('নতুন ডেটা ফাইল তৈরি করা হয়েছে!');
        }
    } catch (error) {
        console.error('ডেটা লোড ত্রুটি:', error);
        showNotification('গুগল ড্রাইভ থেকে ডেটা লোড করতে সমস্যা হয়েছে।', true);
    }
}

// গুগল ড্রাইভে ডেটা সংরক্ষণ
async function saveDataToGoogleDrive() {
    try {
        const fileData = {
            transactions: transactions,
            savingsGoal: savingsGoal,
            lastUpdated: new Date().toISOString()
        };
        
        // JSON স্ট্রিংয়ে রূপান্তর
        const jsonData = JSON.stringify(fileData);
        
        // ড্রাইভে ফাইল খুঁজুন
        const response = await gapi.client.drive.files.list({
            q: "name='money_management_data.json' and trashed=false",
            fields: 'files(id)'
        });
        
        const files = response.result.files;
        let fileId;
        
        if (files.length > 0) {
            // বিদ্যমান ফাইল আপডেট করুন
            fileId = files[0].id;
            await gapi.client.drive.files.update({
                fileId: fileId,
                uploadType: 'media',
                media: {
                    mimeType: 'application/json',
                    body: jsonData
                }
            });
        } else {
            // নতুন ফাইল তৈরি করুন
            const newFile = await gapi.client.drive.files.create({
                resource: {
                    name: 'money_management_data.json',
                    mimeType: 'application/json'
                },
                media: {
                    mimeType: 'application/json',
                    body: jsonData
                },
                fields: 'id'
            });
            
            fileId = newFile.result.id;
        }
        
        // শেষ সিঙ্ক সময় আপডেট করুন
        document.getElementById('last-sync-time').textContent = new Date().toLocaleString();
        document.getElementById('drive-file-name').textContent = 'money_management_data.json';
        
        showNotification('ডেটা গুগল ড্রাইভে সংরক্ষণ করা হয়েছে!');
        return true;
    } catch (error) {
        console.error('ডেটা সংরক্ষণ ত্রুটি:', error);
        showNotification('গুগল ড্রাইভে ডেটা সংরক্ষণ করতে সমস্যা হয়েছে।', true);
        return false;
    }
}

// মূল অ্যাপ্লিকেশন দেখান
function showMainApp() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    
    // UI ইনিশিয়ালাইজেশন
    initializeUI();
    updateUI();
}

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
async function addTransaction() {
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
    
    if (isDemoMode) {
        // ডেমো মোড: লোকাল স্টোরেজে সংরক্ষণ করুন
        saveToLocalStorage();
    } else {
        // গুগল মোড: গুগল ড্রাইভে সংরক্ষণ করুন
        document.getElementById('sync-status').textContent = 'সিঙ্ক হচ্ছে...';
        const success = await saveDataToGoogleDrive();
        document.getElementById('sync-status').textContent = success ? 'সিঙ্ক করা হয়েছে' : 'সিঙ্ক ত্রুটি';
    }
    
    updateUI();
    
    // ফর্ম রিসেট করুন
    document.getElementById('transaction-title').value = '';
    document.getElementById('transaction-amount').value = '';
    document.getElementById('transaction-date').valueAsDate = new Date();
    
    showNotification('লেনদেন সফলভাবে যোগ করা হয়েছে!');
}

// জমার লক্ষ্য নির্ধারণ
async function setSavingsGoal() {
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
    
    if (isDemoMode) {
        // ডেমো মোড: লোকাল স্টোরেজে সংরক্ষণ করুন
        saveToLocalStorage();
    } else {
        // গুগল মোড: গুগল ড্রাইভে সংরক্ষণ করুন
        document.getElementById('sync-status').textContent = 'সিঙ্ক হচ্ছে...';
        const success = await saveDataToGoogleDrive();
        document.getElementById('sync-status').textContent = success ? 'সিঙ্ক করা হয়েছে' : 'সিঙ্ক ত্রুটি';
    }
    
    updateUI();
    
    showNotification('জমার লক্ষ্য সফলভাবে নির্ধারণ করা হয়েছে!');
}

// লেনদেন মুছুন
async function deleteTransaction(id) {
    if (confirm('আপনি কি নিশ্চিত যে আপনি এই লেনদেনটি মুছতে চান?')) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        
        if (isDemoMode) {
            // ডেমো মোড: লোকাল স্টোরেজে সংরক্ষণ করুন
            saveToLocalStorage();
        } else {
            // গুগল মোড: গুগল ড্রাইভে সংরক্ষণ করুন
            document.getElementById('sync-status').textContent = 'সিঙ্ক হচ্ছে...';
            const success = await saveDataToGoogleDrive();
            document.getElementById('sync-status').textContent = success ? 'সিঙ্ক করা হয়েছে' : 'সিঙ্ক ত্রুটি';
        }
        
        updateUI();
        showNotification('লেনদেন মুছে ফেলা হয়েছে!');
    }
}

// UI আপডেট করা
function updateUI() {
    updateSummary();
    renderTransactions();
    renderSavingsTable();
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
    
    // CSV এক্সপোর্ট বাটন
    document.getElementById('export-transactions').addEventListener('click', exportAllTransactions);
    document.getElementById('export-monthly').addEventListener('click', exportMonthlyReport);
    
    // নতুন ব্যাকআপ তৈরি করুন
    document.getElementById('create-backup').addEventListener('click', createNewBackup);
    
    // লগআউট বাটন
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // ম্যানুয়াল সিঙ্ক বাটন
    document.getElementById('manual-sync').addEventListener('click', async () => {
        if (!isDemoMode) {
            document.getElementById('sync-status').textContent = 'সিঙ্ক হচ্ছে...';
            const success = await saveDataToGoogleDrive();
            document.getElementById('sync-status').textContent = success ? 'সিঙ্ক করা হয়েছে' : 'সিঙ্ক ত্রুটি';
        } else {
            showNotification('ডেমো মোডে গুগল ড্রাইভ সিঙ্ক উপলব্ধ নয়।', true);
        }
    });
    
    // জোরপূর্বক সিঙ্ক বাটন
    document.getElementById('force-sync').addEventListener('click', async () => {
        if (!isDemoMode) {
            document.getElementById('sync-status').textContent = 'সিঙ্ক হচ্ছে...';
            const success = await saveDataToGoogleDrive();
            document.getElementById('sync-status').textContent = success ? 'সিঙ্ক করা হয়েছে' : 'সিঙ্ক ত্রুটি';
        } else {
            showNotification('ডেমো মোডে গুগল ড্রাইভ সিঙ্ক উপলব্ধ নয়।', true);
        }
    });
}

// লগআউট
function handleLogout() {
    if (isDemoMode) {
        // ডেমো মোড লগআউট
        if (confirm('আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?')) {
            // লগইন পৃষ্ঠায় ফিরে যান
            document.getElementById('login-page').classList.remove('hidden');
            document.getElementById('app').classList.add('hidden');
            
            showNotification('সফলভাবে লগআউট করা হয়েছে!');
        }
    } else {
        // গুগল মোড লগআউট
        const auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function() {
            // লগইন পৃষ্ঠায় ফিরে যান
            document.getElementById('login-page').classList.remove('hidden');
            document.getElementById('app').classList.add('hidden');
            
            showNotification('সফলভাবে লগআউট করা হয়েছে!');
        });
    }
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
        ধরন: t.type === 'income' ? 'আয়' : t.type === 'expense' ? 'ব্যয়' : 'জমা',
        বিবরণ: t.title,
        ক্যাটাগরি: t.category,
        'পরিমাণ (৳)': t.amount
    }));
    
    const csv = convertToCSV(data, headers);
    const filename = `${currentMonthName}_${currentYear}_রিপোর্ট.csv`;
    downloadCSV(csv, filename);
}

// নতুন ব্যাকআপ তৈরি করুন
async function createNewBackup() {
    if (isDemoMode) {
        showNotification('ডেমো মোডে গুগল ড্রাইভ ব্যাকআপ উপলব্ধ নয়।', true);
        return;
    }
    
    const backupName = `money_management_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const fileData = {
        transactions: transactions,
        savingsGoal: savingsGoal,
        backupDate: new Date().toISOString(),
        version: '1.0'
    };
    
    try {
        const jsonData = JSON.stringify(fileData);
        
        const newFile = await gapi.client.drive.files.create({
            resource: {
                name: backupName,
                mimeType: 'application/json'
            },
            media: {
                mimeType: 'application/json',
                body: jsonData
            },
            fields: 'id'
        });
        
        showNotification(`নতুন ব্যাকআপ তৈরি করা হয়েছে: ${backupName}`);
    } catch (error) {
        console.error('ব্যাকআপ তৈরি ত্রুটি:', error);
        showNotification('ব্যাকআপ তৈরি করতে সমস্যা হয়েছে।', true);
    }
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

// গ্লোবাল ফাংশন (HTML থেকে সরাসরি কল করার জন্য)
window.deleteTransaction = deleteTransaction;