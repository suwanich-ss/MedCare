const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

// PODT API V1 Auth and Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, phone_number, role} = req.body;
        if (!email || !password || !username) {
            return res.status(400).json({success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน"})
        
        }
        const { data: existingUser} = await supabase.from('users').select('email').eq('email', email).single();
        if (existingUser) {
            return res.status(400).json({success: false, message: "อีเมลนี้ถูกใช้งานไปแล้ว"})
        }

        // Hash Password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        //Seve in supabase
        const {data, error} =  await supabase
            .from('users')
            .insert([{ username, email, password_hash, phone_number, role: role || 'caregiver'}])
            .select('user_id, username, email, role')
            .single();

        if (error) throw error;
        res.status(201).json({success: true, message: "สมัครสมาชิกสำเร็จ", user: data })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST 

// 1.2 POST /api/v1/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // ค้นหาผู้ใช้จากอีเมล (เปลี่ยนชื่อจาก data เป็น user เพื่อให้เรียกใช้ง่าย)
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        // ถ้ามี error หรือไม่เจอ user
        if (error || !user) {
            return res.status(401).json({ success: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }

        // ตรวจสอบรหัสผ่าน โดยใช้รหัสที่ user กรอก เทียบกับ password_hash ในตัวแปร user
        const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }

        // อัปเดตเวลาล็อกอินล่าสุด
        await supabase.from('users').update({ last_login: new Date() }).eq('user_id', user.user_id);

        // ส่งข้อมูลกลับไปให้หน้าบ้าน (ใช้ตัวแปร user ทั้งหมด ไม่ใช้คำว่า data)
        res.json({
            success: true,
            message: "เข้าสู่ระบบสำเร็จ",
            user: { 
                user_id: user.user_id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            }
        });
        
    } catch (error) {
        // ตัวนี้จะคอยพ่นบอกว่าในบล็อก try มีอะไรพัง
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;