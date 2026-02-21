const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /trips
router.get('/', authMiddleware([]), async (req, res) => {
    try {
        const trips = await prisma.trip.findMany({
            include: { vehicle: true, driver: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(trips);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch trips', details: err.message });
    }
});

// POST /trips — dispatch a trip with validations
router.post('/', authMiddleware(['dispatcher', 'manager']), async (req, res) => {
    try {
        const { vehicleId, driverId, cargoWeight, origin, destination } = req.body;

        // Fetch vehicle and driver
        const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
        const driver = await prisma.driver.findUnique({ where: { id: driverId } });

        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
        if (!driver) return res.status(404).json({ error: 'Driver not found' });

        // Validation: capacity
        if (cargoWeight > vehicle.maxCapacity) {
            return res.status(400).json({ error: `Cargo weight (${cargoWeight}) exceeds vehicle capacity (${vehicle.maxCapacity})` });
        }

        // Validation: license expiry
        if (new Date(driver.licenseExpiry) < new Date()) {
            return res.status(400).json({ error: `Driver license expired on ${driver.licenseExpiry.toISOString().split('T')[0]}` });
        }

        // Validation: vehicle availability
        if (vehicle.status !== 'available') {
            return res.status(400).json({ error: `Vehicle is currently ${vehicle.status}` });
        }

        // Validation: driver availability
        if (driver.status !== 'off_duty') {
            return res.status(400).json({ error: `Driver is currently ${driver.status}` });
        }

        // Create trip
        const trip = await prisma.trip.create({
            data: {
                vehicleId, driverId,
                cargoWeight: parseFloat(cargoWeight),
                origin, destination,
                state: 'dispatched',
                startOdometer: vehicle.odometer,
            },
            include: { vehicle: true, driver: true },
        });

        // Update statuses
        await prisma.vehicle.update({ where: { id: vehicleId }, data: { status: 'on_trip' } });
        await prisma.driver.update({ where: { id: driverId }, data: { status: 'on_duty' } });

        const io = req.app.get('io');
        if (io) io.emit('statusUpdate', { type: 'tripDispatched', trip });

        res.status(201).json(trip);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create trip', details: err.message });
    }
});

// PUT /trips/:id — update trip state (complete, cancel)
router.put('/:id', authMiddleware(['dispatcher', 'manager']), async (req, res) => {
    try {
        const tripId = parseInt(req.params.id);
        const { state, endOdometer } = req.body;

        const existingTrip = await prisma.trip.findUnique({ where: { id: tripId } });
        if (!existingTrip) return res.status(404).json({ error: 'Trip not found' });

        const updateData = { state };

        // On completion, update odometer and reset statuses
        if (state === 'completed' && endOdometer) {
            updateData.endOdometer = parseFloat(endOdometer);

            await prisma.vehicle.update({
                where: { id: existingTrip.vehicleId },
                data: { status: 'available', odometer: parseFloat(endOdometer) },
            });
            await prisma.driver.update({
                where: { id: existingTrip.driverId },
                data: { status: 'off_duty' },
            });
        }

        // On cancellation, reset statuses
        if (state === 'cancelled') {
            await prisma.vehicle.update({ where: { id: existingTrip.vehicleId }, data: { status: 'available' } });
            await prisma.driver.update({ where: { id: existingTrip.driverId }, data: { status: 'off_duty' } });
        }

        const trip = await prisma.trip.update({
            where: { id: tripId },
            data: updateData,
            include: { vehicle: true, driver: true },
        });

        const io = req.app.get('io');
        if (io) io.emit('statusUpdate', { type: 'tripUpdated', trip });

        res.json(trip);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update trip', details: err.message });
    }
});

module.exports = router;
