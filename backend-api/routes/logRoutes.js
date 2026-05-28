const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.post('/taken', async (req, res) => {
    try {
        const { taken_data, amount_taken, status, schedule_id, elderly_id} = req.body;

        const { data, error } = await supabase
        .from('medication_histories')
        .insert([{
            taken_data,
            amount_taken,
            status, //'taken', 'skipped', 'missed'
            actual_taken_time: status === 'taken' ? new Date(): null,
            schedule_id,
            elderly_id
        }])
        .select()
        .single();

        if (error) throw error;
        res.status(201).json({ success: true, message: "บันทึกประวัติการทานยาแล้ว", data});

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/history', async (req, res) => {
    try {
        const { elderly_id } = req.query;

        let query = supabase
        .from('medication_histories')
        .select(`
                *,
                medication_schedules (
                    medication_time,
                    medicines (name, dosage, unit)
                )
            `)
        .order('taken_date',{ ascending: false } );

        if (elderly_id) query = query.eq('elderly_id', elderly_id);
        const { data , error} = await query;
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message})
    }
});

module.exports = router;
