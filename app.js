// গুগল ক্লায়েন্ট কনফিগারেশন - এখানে আপনার প্রাপ্ত তথ্য বসান
const GOOGLE_CLIENT_ID = '454037160192-4domj7ecg0ibk1dq2tg3pf4pqj6qk71i.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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'; // Note: Client secret should be handled server-side in production

// গুগল API ইনিশিয়ালাইজেশন
function initGoogleAuth() {
    gapi.load('auth2', function() {
        gapi.auth2.init({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'profile email https://www.googleapis.com/auth/drive.file',
            fetch_basic_profile: true
        }).then(function() {
            console.log('Google Auth initialized successfully');
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
        loadDataFromGoogleDrive(googleUser).then(() => {
            // মূল অ্যাপ্লিকেশন দেখান
            showMainApp();
            
            // স্পিনার লুকান
            document.getElementById('login-spinner').classList.add("hidden");
            
            // ফিডব্যাক আপডেট করুন
            const feedback = document.getElementById('login-feedback');
            feedback.textContent = "গুগল ড্রাইভ থেকে ডেটা লোড করা হয়েছে!";
            feedback.classList.add("success");
        }).catch(error => {
            console.error('Error loading data from Google Drive:', error);
            showNotification('ডেটা লোড করতে সমস্যা হয়েছে, কিন্তু আপনি অ্যাপ ব্যবহার করতে পারেন', true);
            showMainApp();
        });
        
    }).catch(function(error) {
        // লগইন失败
        console.error('Login failed: ', error);
        
        // স্পিনার লুকান
        document.getElementById('login-spinner').classList.add("hidden");
        
        // ফিডব্যাক আপডেট করুন
        const feedback = document.getElementById('login-feedback');
        feedback.textContent = "লগইন失败: " + (error.error || 'অজানা ত্রুটি');
        feedback.classList.add("error");
        
        // লগইন বাটন সক্রিয় করুন
        document.getElementById('google-login').disabled = false;
        document.getElementById('demo-login').disabled = false;
    });
}

// গুগল ড্রাইভ থেকে ডেটা লোড করা (এক্সেস টোকেন সহ)
async function loadDataFromGoogleDrive(googleUser) {
    try {
        // গুগল ড্রাইভ API এর জন্য এক্সেস টোকেন পান
        const accessToken = googleUser.getAuthResponse().access_token;
        
        // ড্রাইভে ফাইল খুঁজুন
        const response = await fetch('https://www.googleapis.com/drive/v3/files?q=name="money_management_data.json" and trashed=false', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        
        if (!response.ok) {
            throw new Error('Google Drive API request failed');
        }
        
        const data = await response.json();
        const files = data.files;
        
        if (files.length > 0) {
            // ফাইল পাওয়া গেছে, ডেটা লোড করুন
            const fileId = files[0].id;
            const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });
            
            if (!fileResponse.ok) {
                throw new Error('Failed to download file from Google Drive');
            }
            
            const fileData = await fileResponse.json();
            transactions = fileData.transactions || [];
            savingsGoal = fileData.savingsGoal || { target: null, date: null };
            
            // শেষ সিঙ্ক সময় আপডেট করুন
            document.getElementById('last-sync-time').textContent = new Date().toLocaleString();
            document.getElementById('drive-file-name').textContent = files[0].name;
            
            showNotification('গুগল ড্রাইভ থেকে ডেটা লোড করা হয়েছে!');
        } else {
            // নতুন ফাইল তৈরি করুন
            await saveDataToGoogleDrive(googleUser);
            showNotification('নতুন ডেটা ফাইল তৈরি করা হয়েছে!');
        }
    } catch (error) {
        console.error('ডেটা লোড ত্রুটি:', error);
        throw error;
    }
}

// গুগল ড্রাইভে ডেটা সংরক্ষণ (এক্সেস টোকেন সহ)
async function saveDataToGoogleDrive(googleUser) {
    try {
        const accessToken = googleUser.getAuthResponse().access_token;
        const fileData = {
            transactions: transactions,
            savingsGoal: savingsGoal,
            lastUpdated: new Date().toISOString()
        };
        
        // JSON স্ট্রিংয়ে রূপান্তর
        const jsonData = JSON.stringify(fileData);
        
        // ড্রাইভে ফাইল খুঁজুন
        const searchResponse = await fetch('https://www.googleapis.com/drive/v3/files?q=name="money_management_data.json" and trashed=false', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        
        if (!searchResponse.ok) {
            throw new Error('Google Drive API request failed');
        }
        
        const searchData = await searchResponse.json();
        const files = searchData.files;
        let fileId;
        
        if (files.length > 0) {
            // বিদ্যমান ফাইল আপডেট করুন
            fileId = files[0].id;
            const updateResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: jsonData
            });
            
            if (!updateResponse.ok) {
                throw new Error('Failed to update file in Google Drive');
            }
        } else {
            // নতুন ফাইল তৈরি করুন
            const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'money_management_data.json',
                    mimeType: 'application/json'
                })
            });
            
            if (!createResponse.ok) {
                throw new Error('Failed to create file in Google Drive');
            }
            
            const createData = await createResponse.json();
            fileId = createData.id;
            
            // ফাইল কন্টেন্ট আপলোড করুন
            const mediaResponse = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: jsonData
            });
            
            if (!mediaResponse.ok) {
                throw new Error('Failed to upload file content to Google Drive');
            }
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