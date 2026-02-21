const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /maintenance — all logs
router.get('/', authMiddleware([]), async (req, res) => {
    try {
        const logs = await prisma.maintenanceLog.findMany({
            include: { vehicle: true },
            orderBy: { date: 'desc' },
        });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch maintenance logs', details: err.message });
    }
});

// POST /maintenance — create, auto set vehicle to in_shop
router.post('/', authMiddleware(['manager', 'safety_officer']), async (req, res) => {
    try {
        const { vehicleId, description, cost } = req.body;

        const log = await prisma.maintenanceLog.create({
            data: {
                vehicleId: parseInt(vehicleId),
                description,
                cost: parseFloat(cost || 0),
            },
            include: { vehicle: true },
        });

        // Auto-set vehicle status to in_shop
        await prisma.vehicle.update({
            where: { id: parseInt(vehicleId) },
            data: { status: 'in_shop' },
        });

        const io = req.app.get('io');
        if (io) io.emit('vehicleUpdate', { type: 'maintenance', vehicleId });

        res.status(201).json(log);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create maintenance log', details: err.message });
    }
});

module.exports = router;
