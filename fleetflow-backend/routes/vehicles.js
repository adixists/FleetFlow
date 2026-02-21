const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /vehicles — list all
router.get('/', authMiddleware([]), async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            include: { _count: { select: { trips: true, maintenanceLogs: true, fuelLogs: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch vehicles', details: err.message });
    }
});

// GET /vehicles/:id
router.get('/:id', authMiddleware([]), async (req, res) => {
    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { trips: true, maintenanceLogs: true, fuelLogs: true },
        });
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
        res.json(vehicle);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch vehicle', details: err.message });
    }
});

// POST /vehicles — create
router.post('/', authMiddleware(['manager']), async (req, res) => {
    try {
        const { name, licensePlate, maxCapacity, odometer } = req.body;
        const vehicle = await prisma.vehicle.create({
            data: { name, licensePlate, maxCapacity: parseFloat(maxCapacity), odometer: parseFloat(odometer || 0) },
        });

        const io = req.app.get('io');
        if (io) io.emit('vehicleUpdate', vehicle);

        res.status(201).json(vehicle);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create vehicle', details: err.message });
    }
});

// PUT /vehicles/:id — update
router.put('/:id', authMiddleware(['manager']), async (req, res) => {
    try {
        const vehicle = await prisma.vehicle.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });

        const io = req.app.get('io');
        if (io) io.emit('vehicleUpdate', vehicle);

        res.json(vehicle);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update vehicle', details: err.message });
    }
});

// DELETE /vehicles/:id
router.delete('/:id', authMiddleware(['manager']), async (req, res) => {
    try {
        await prisma.vehicle.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Vehicle deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete vehicle', details: err.message });
    }
});

module.exports = router;
