// balance.js
import { supabase } from './supabase.js'

// Telegram user ID yoki fallback
const tg = window.Telegram?.WebApp
export const userId = tg?.initDataUnsafe?.user?.id || 'user_' + Date.now()

// Balansni yuklash
export async function loadBalance() {
    const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single()
    
    if (error) {
        console.log("Load balance error:", error)
    }
    
    const bal = data?.balance || 0
    document.getElementById('balance').innerText = bal.toFixed(2)
}

// Balansga pul qo‘shish
export async function addBalance(amount) {
    // Foydalanuvchi balansini olish
    const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single()
    
    if (error) {
        console.log("Get balance error:", error)
    }
    
    if (!data) {
        // Yangi foydalanuvchi qo‘shish
        const { error: insertError } = await supabase
            .from('users')
            .insert([{ id: userId.toString(), balance: amount }])
        if (insertError) console.log("Insert error:", insertError)
    } else {
        // Foydalanuvchi bor — balansni yangilash
        const newBalance = (data.balance || 0) + amount
        const { error: updateError } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', userId.toString())
        if (updateError) console.log("Update error:", updateError)
    }
    
    // Yangilangan balansni ekranga chiqarish
    loadBalance()
}
