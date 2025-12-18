import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDIeG8dVbm0Yk7FR1hPzrBoD7rgDKWAFoY",
    authDomain: "user1111-c84a0.firebaseapp.com",
    databaseURL: "https://user1111-c84a0-default-rtdb.firebaseio.com",
    projectId: "user1111-c84a0",
    storageBucket: "user1111-c84a0.appspot.com",
    messagingSenderId: "901723757936",
    appId: "1:901723757936:web:9da0a1c7ec494f4a0c03b5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Har bir user uchun alohida ID olish
function getUserId() {
    let finalId = "";
    
    // 1. Telegramdan ID olishga urinish
    try {
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        if (tgUser && tgUser.id) {
            finalId = "tg_" + tgUser.id;
        }
    } catch (e) {
        console.log("Telegram SDK topilmadi");
    }

    // 2. Agar TG bo'lmasa, Brauzer LocalStorage ishlatish
    if (!finalId) {
        finalId = localStorage.getItem('rocket_mining_uid');
        if (!finalId) {
            finalId = "user_" + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('rocket_mining_uid', finalId);
        }
    }
    
    return finalId;
}

const userId = getUserId(); 

const AdController = window.Adsgram.init({ blockId: "int-19304" });

async function handleClaim() {
    try {
        const result = await AdController.show();
        
        if (result.done) {
            startRocketAnimation();
            
            const userRef = ref(db, 'users/' + userId);
            const snapshot = await get(userRef);
            const now = Date.now();
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                // 30 minutlik tekshiruv
                if (now - data.lastClaim < 30 * 60 * 1000) {
                    alert("Iltimos, kutib turing!");
                    return;
                }
                const newBalance = (parseFloat(data.balance) || 0) + 0.0001;
                await update(userRef, { balance: newBalance, lastClaim: now });
            } else {
                await set(userRef, { balance: 0.0001, lastClaim: now });
            }
            
            loadUserData();
        } else {
            alert("Mukofot olish uchun reklamani oxirigacha ko'ring!");
        }
    } catch (e) {
        console.error("AdsGram Error:", e);
        alert("Reklama yuklanmadi. Iltimos, keyinroq urinib ko'ring.");
    }
}

function startRocketAnimation() {
    const rocket = document.getElementById('rocket');
    rocket.classList.add('flying', 'animate__animated', 'animate__bounceOutUp');
    setTimeout(() => {
        rocket.classList.remove('animate__bounceOutUp');
        rocket.classList.add('animate__bounceInDown');
    }, 2000);
}

async function loadUserData() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById('balance').innerText = (data.balance || 0).toFixed(4) + " TON";
        checkTimer(data.lastClaim);
    }
}

function checkTimer(lastClaim) {
    if (!lastClaim) return;
    
    const btn = document.getElementById('claimBtn');
    const timerDiv = document.getElementById('timer');
    
    const interval = setInterval(() => {
        const now = Date.now();
        const diff = (30 * 60 * 1000) - (now - lastClaim);
        
        if (diff <= 0) {
            btn.disabled = false;
            btn.innerText = "CLAIM 0.0001 TON";
            timerDiv.classList.add('hidden');
            clearInterval(interval);
        } else {
            btn.disabled = true;
            btn.innerText = "KUTING...";
            timerDiv.classList.remove('hidden');
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            timerDiv.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
    }, 1000);
}

window.handleClaim = handleClaim;
loadUserData();
