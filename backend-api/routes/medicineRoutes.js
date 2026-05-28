const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.get('/' , async (req, res) => {
    try {
        const { elderly_id } = req.query;
        let query = supabase.from('medicines').select('*');

        if (elderly_id) query = query.eq('elderly_id', elderly_id);
        const { data, error} = await query;
        if (error) throw error;

        res.json({success: true, data })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message})
    }
});

router.post('/', async (req, res) => {
    try {
        console.log("ข้อมูลที่ส่งมาจาก Postman คือ:", req.body);
        const {name, dosage, usage_instruction, notes, category, color, unit, image_url, ocr_text, elderly_id} = req.body;

        const {data, error} = await supabase 
        .from('medicines')
        .insert([{name, dosage, usage_instruction, notes, category, color, unit, image_url, ocr_text, elderly_id: elderly_id || null }])
        .select()
        .single();

        if (error) throw error;
        res.status(201).json({ success: true, message: "เพิ่มยาเรียบร้อยแล้ว", data})
    } catch (error) {
        res.status(500).json({ success: false, error: error.message } );
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const {data, error} = await supabase
        .from('medicines')
        .update(updateData)
        .qe('medicines', id)
        .select()
        .single();

        if (error) throw error;
        res.json({ success: true, message: "แก้ไขข้อมูลยาสำเร็จ", data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }    
});

router.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {error} = await supabase.from('medicines'.delete().qe('medicines', id));
        if (error) throw error;

        res.json({ success: true, message: "ลบข้อมูลยาเรียบร้อยแล้ว"});
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;