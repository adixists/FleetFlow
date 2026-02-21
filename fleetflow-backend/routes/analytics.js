const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /analytics — detailed fleet analytics
router.get('/', authMiddleware(['manager', 'analyst']), async (req, res) => {
    try {
        // Fleet utilization: % of vehicles on_trip
        const vehicles = await prisma.vehicle.findMany();
        const activeVehicles = vehicles.filter(v => v.status === 'on_trip').length;
        const fleetUtilization = vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0;

        // Fuel efficiency per vehicle (odometer / total liters)
        const fuelEfficiency = await Promise.all(
            vehicles.map(async (v) => {
                const fuelAgg = await prisma.fuelLog.aggregate({
                    where: { vehicleId: v.id },
                    _sum: { liters: true, cost: true },
                });
                const totalLiters = fuelAgg._sum.liters || 0;
                return {
                    vehicleId: v.id,
                    vehicleName: v.name,
                    licensePlate: v.licensePlate,
                    odometer: v.odometer,
                    totalLiters,
                    totalFuelCost: fuelAgg._sum.cost || 0,
                    kmPerLiter: totalLiters > 0 ? Math.round((v.odometer / totalLiters) * 100) / 100 : null,
                };
            })
        );

        // Vehicle ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
        const vehicleROI = await Promise.all(
            vehicles.map(async (v) => {
                const fuelAgg = await prisma.fuelLog.aggregate({
                    where: { vehicleId: v.id },
                    _sum: { cost: true },
                });
                const maintAgg = await prisma.maintenanceLog.aggregate({
                    where: { vehicleId: v.id },
                    _sum: { cost: true },
                });
                const totalExpenses = (fuelAgg._sum.cost || 0) + (maintAgg._sum.cost || 0);
                const roi = v.acquisitionCost > 0
                    ? Math.round(((v.totalRevenue - totalExpenses) / v.acquisitionCost) * 100)
                    : 0;

                return {
                    vehicleId: v.id,
                    vehicleName: v.name,
                    licensePlate: v.licensePlate,
                    acquisitionCost: v.acquisitionCost,
                    totalRevenue: v.totalRevenue,
                    totalExpenses,
                    roiPercentage: roi,
                };
            })
        );

        // Monthly trip counts (last 12 months)
        const trips = await prisma.trip.findMany({ orderBy: { createdAt: 'asc' } });
        const monthlyTrips = {};
        trips.forEach(t => {
            const key = `${t.createdAt.getFullYear()}-${String(t.createdAt.getMonth() + 1).padStart(2, '0')}`;
            monthlyTrips[key] = (monthlyTrips[key] || 0) + 1;
        });

        // Cost breakdown
        const fuelTotal = await prisma.fuelLog.aggregate({ _sum: { cost: true } });
        const maintTotal = await prisma.maintenanceLog.aggregate({ _sum: { cost: true } });

        // Total Revenue for dashboard/analytics
        const revenueTotal = vehicles.reduce((sum, v) => sum + v.totalRevenue, 0);

        // Top drivers by completed trips
        const drivers = await prisma.driver.findMany({ include: { _count: { select: { trips: true } } } });
        const topDrivers = await Promise.all(
            drivers.map(async d => {
                const completed = await prisma.trip.count({ where: { driverId: d.id, state: 'completed' } });
                return { id: d.id, name: d.name, totalTrips: d._count.trips, completedTrips: completed, safetyScore: d.safetyScore };
            })
        );
        topDrivers.sort((a, b) => b.completedTrips - a.completedTrips);

        res.json({
            fleetUtilization,
            fuelEfficiency,
            vehicleROI,
            monthlyTrips,
            metrics: {
                totalRevenue: revenueTotal,
                totalExpenses: (fuelTotal._sum.cost || 0) + (maintTotal._sum.cost || 0)
            },
            costBreakdown: {
                fuel: fuelTotal._sum.cost || 0,
                maintenance: maintTotal._sum.cost || 0,
            },
            topDrivers: topDrivers.slice(0, 10),
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
    }
});

module.exports = router;
