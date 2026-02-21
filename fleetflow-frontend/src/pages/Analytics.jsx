import { useState, useEffect } from 'react';
import api from '../api/axios';
import KPICard from '../components/KPICard';
import {
    Box, Typography, Grid, Paper, Button,
} from '@mui/material';
import { Speed, LocalGasStation, TrendingUp, EmojiEvents, Download } from '@mui/icons-material';
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#6C63FF', '#00D9A6', '#FFB74D', '#FF5252', '#29B6F6', '#CE93D8'];

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: d } = await api.get('/analytics');
                setData(d);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const exportCSV = () => {
        if (!data?.fuelEfficiency) return;
        const header = 'Vehicle,License Plate,Odometer,Total Liters,Total Fuel Cost,KM/Liter\n';
        const rows = data.fuelEfficiency.map(v =>
            `${v.vehicleName},${v.licensePlate},${v.odometer},${v.totalLiters},${v.totalFuelCost},${v.kmPerLiter || 'N/A'}`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'fleet_analytics.csv'; a.click();
    };

    if (loading) return <Typography>Loading analytics...</Typography>;
    if (!data) return <Typography>Failed to load analytics.</Typography>;

    const monthlyData = Object.entries(data.monthlyTrips || {}).map(([month, count]) => ({ month, trips: count }));
    const costData = [
        { name: 'Fuel', value: data.costBreakdown?.fuel || 0 },
        { name: 'Maintenance', value: data.costBreakdown?.maintenance || 0 },
    ].filter(d => d.value > 0);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4">Analytics</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Fleet performance insights</Typography>
                </Box>
                <Button variant="outlined" startIcon={<Download />} onClick={exportCSV}
                    sx={{ borderColor: '#6C63FF', color: '#6C63FF' }}>
                    Export CSV
                </Button>
            </Box>

            {/* KPI Row */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard title="Fleet Utilization" value={`${data.fleetUtilization}%`} icon={<Speed fontSize="inherit" />} color="#6C63FF" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard title="Total Fuel Cost" value={`$${(data.costBreakdown?.fuel || 0).toLocaleString()}`} icon={<LocalGasStation fontSize="inherit" />} color="#FFB74D" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard title="Maintenance Cost" value={`$${(data.costBreakdown?.maintenance || 0).toLocaleString()}`} icon={<TrendingUp fontSize="inherit" />} color="#FF5252" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard title="Top Driver" value={data.topDrivers?.[0]?.name || 'N/A'}
                        subtitle={`${data.topDrivers?.[0]?.completedTrips || 0} trips completed`}
                        icon={<EmojiEvents fontSize="inherit" />} color="#00D9A6" />
                </Grid>
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                {/* Monthly Trips */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, height: 350 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Monthly Trip Volume</Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                <Bar dataKey="trips" fill="#6C63FF" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Cost Breakdown Pie */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, height: 350 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Cost Breakdown</Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie data={costData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {costData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Fuel Efficiency Table */}
            <Paper sx={{ p: 2.5, borderRadius: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Fuel Efficiency by Vehicle</Typography>
                <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Vehicle', 'Plate', 'Odometer (km)', 'Total Liters', 'Fuel Cost ($)', 'KM/Liter'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#9CA3AF', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.fuelEfficiency?.map(v => (
                                <tr key={v.vehicleId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{v.vehicleName}</td>
                                    <td style={{ padding: '10px 12px', color: '#9CA3AF' }}>{v.licensePlate}</td>
                                    <td style={{ padding: '10px 12px' }}>{v.odometer?.toLocaleString()}</td>
                                    <td style={{ padding: '10px 12px' }}>{v.totalLiters?.toLocaleString()}</td>
                                    <td style={{ padding: '10px 12px' }}>${v.totalFuelCost?.toLocaleString()}</td>
                                    <td style={{ padding: '10px 12px', fontWeight: 700, color: v.kmPerLiter > 300 ? '#4CAF50' : '#FFB74D' }}>{v.kmPerLiter || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            </Paper>

            {/* Top Drivers */}
            <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Top Drivers</Typography>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.topDrivers || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" tick={{ fill: '#9CA3AF', fontSize: 12 }} width={120} />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                        <Legend />
                        <Bar dataKey="completedTrips" name="Completed" fill="#00D9A6" radius={[0, 6, 6, 0]} />
                        <Bar dataKey="safetyScore" name="Safety Score" fill="#6C63FF" radius={[0, 6, 6, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Paper>
        </Box>
    );
}
