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

// Foydalanuvchi ID
const userId = "user_test_123"; 

// AdsGram Controllerni init qilish
const AdController = window.Adsgram.init({ blockId: "int-18370" });

async function handleClaim() {
    try {
        // Reklamani ko'rsatish va natijani kutish
        const result = await AdController.show();
        
        if (result.done) {
            // Reklama muvaffaqiyatli ko'rilsa
            startRocketAnimation();
            
            const userRef = ref(db, 'users/' + userId);
            const snapshot = await get(userRef);
            const now = Date.now();
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (now - data.lastClaim < 30 * 60 * 1000) {
                    alert("Iltimos, kutib turing!");
                    return;
                }
                const newBalance = (data.balance || 0) + 0.0001;
                await update(userRef, { balance: newBalance, lastClaim: now });
            } else {
                await set(userRef, { balance: 0.0001, lastClaim: now });
            }
            
            loadUserData();
        } else {
            // Foydalanuvchi reklamani yopib yuborsa
            alert("Mukofot olish uchun reklamani oxirigacha ko'ring!");
        }
    } catch (e) {
        // Reklama yuklanishda xato (bloklovchilar yoki tarmoq xatosi)
        console.error("AdsGram Error:", e);
        alert("Reklama yuklanmadi. Iltimos, AdBlock'ni o'chiring.");
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
        document.getElementById('balance').innerText = data.balance.toFixed(4) + " TON";
        checkTimer(data.lastClaim);
    }
}

function checkTimer(lastClaim) {
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

// Funksiyani global qilish (HTML dagi onclick ishlashi uchun)
window.handleClaim = handleClaim;
loadUserData();