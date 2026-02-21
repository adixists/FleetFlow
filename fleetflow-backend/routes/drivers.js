const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /drivers
router.get('/', authMiddleware([]), async (req, res) => {
    try {
        const drivers = await prisma.driver.findMany({
            include: { _count: { select: { trips: true } } },
            orderBy: { createdAt: 'desc' },
        });

        // Compute completion rate for each driver
        const driversWithStats = await Promise.all(
            drivers.map(async (driver) => {
                const totalTrips = driver._count.trips;
                const completedTrips = await prisma.trip.count({
                    where: { driverId: driver.id, state: 'completed' },
                });
                return {
                    ...driver,
                    totalTrips,
                    completedTrips,
                    completionRate: totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0,
                };
            })
        );

        res.json(driversWithStats);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch drivers', details: err.message });
    }
});

// GET /drivers/:id
router.get('/:id', authMiddleware([]), async (req, res) => {
    try {
        const driver = await prisma.driver.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { trips: { include: { vehicle: true } } },
        });
        if (!driver) return res.status(404).json({ error: 'Driver not found' });
        res.json(driver);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch driver', details: err.message });
    }
});

// POST /drivers
router.post('/', authMiddleware(['manager']), async (req, res) => {
    try {
        const { name, licenseExpiry, safetyScore } = req.body;
        const driver = await prisma.driver.create({
            data: {
                name,
                licenseExpiry: new Date(licenseExpiry),
                safetyScore: parseFloat(safetyScore || 100),
            },
        });
        res.status(201).json(driver);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create driver', details: err.message });
    }
});

// PUT /drivers/:id
router.put('/:id', authMiddleware(['manager', 'safety_officer']), async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.licenseExpiry) data.licenseExpiry = new Date(data.licenseExpiry);
        if (data.safetyScore) data.safetyScore = parseFloat(data.safetyScore);

        const driver = await prisma.driver.update({
            where: { id: parseInt(req.params.id) },
            data,
        });
        res.json(driver);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update driver', details: err.message });
    }
});

// DELETE /drivers/:id
router.delete('/:id', authMiddleware(['manager']), async (req, res) => {
    try {
        await prisma.driver.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Driver deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete driver', details: err.message });
    }
});

module.exports = router;
