const express = require('express');
const supabase = require('./config/supabase');
require('dotenv').config();

// routes add
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const logRoutes = require('./routes/logRoutes');


const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/medications',medicineRoutes);
app.use('//api/v1/logs',logRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Welcome to MedCare API V1" });
})
app.listen(PORT, () => {
    console.log(`Server MedCare API V1 running on port ${PORT}`);
});