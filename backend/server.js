const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { router: patientRouter } = require('./routes/patientRoutes');
const scheduleRouter = require('./routes/scheduleRoutes');
const appointmentRouter = require('./routes/appointmentRoutes');
const billingRouter = require('./routes/billingRoutes');
const portalRouter = require('./routes/portalRoutes');
const authRouter = require('./routes/authRoutes');
const requireAuth = require('./middleware/requireAuth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Mediczen Doctor Dashboard API'
  });
});

// API Routes
app.use('/api/patients', requireAuth, patientRouter);
app.use('/api/schedules', requireAuth, scheduleRouter);
app.use('/api/appointments', requireAuth, appointmentRouter);
app.use('/api/invoices', requireAuth, billingRouter);
app.use('/api/portal', portalRouter);
app.use('/api/auth', authRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Mediczen Backend Express Server running on http://localhost:${PORT}`);
});
