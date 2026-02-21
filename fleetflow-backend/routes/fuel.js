const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /fuel — all logs with optional vehicle filter
router.get('/', authMiddleware([]), async (req, res) => {
    try {
        const where = req.query.vehicleId ? { vehicleId: parseInt(req.query.vehicleId) } : {};
        const logs = await prisma.fuelLog.findMany({
            where,
            include: { vehicle: true },
            orderBy: { date: 'desc' },
        });

        // Compute totals
        const totalCost = logs.reduce((sum, l) => sum + l.cost, 0);
        const totalLiters = logs.reduce((sum, l) => sum + l.liters, 0);

        res.json({ logs, totalCost, totalLiters });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch fuel logs', details: err.message });
    }
});

// POST /fuel
router.post('/', authMiddleware(['manager', 'dispatcher']), async (req, res) => {
    try {
        const { vehicleId, liters, cost } = req.body;
        const log = await prisma.fuelLog.create({
            data: {
                vehicleId: parseInt(vehicleId),
                liters: parseFloat(liters),
                cost: parseFloat(cost),
            },
            include: { vehicle: true },
        });
        res.status(201).json(log);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create fuel log', details: err.message });
    }
});

module.exports = router;
