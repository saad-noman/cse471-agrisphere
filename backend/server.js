require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const expertRoutes = require('./routes/expertRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const diseaseRoutes = require('./routes/diseaseRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const farmRecordRoutes = require('./routes/farmRecordRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const mapRoutes = require('./routes/mapRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const farmingRecommendationRoutes = require('./routes/farmingRecommendationRoute');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/farm-records', farmRecordRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/farming-recommendation', farmingRecommendationRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});

