import { useState, useEffect } from 'react';
import api from '../api/axios';
import KPICard from '../components/KPICard';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { Speed, LocalGasStation, TrendingUp, EmojiEvents, Download } from '@mui/icons-material';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { CHART_COLORS, PALETTE, PAGE_COLORS } from '../tokens';
import { alpha } from '@mui/material/styles';

// Shared dark tooltip style
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <Box sx={{
            background: '#1A2540', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2, px: 2, py: 1.5, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
            {label && <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: '0.75rem' }}>{label}</Typography>}
            {payload.map((p, i) => (
                <Typography key={i} variant="body2" sx={{ color: p.color, fontWeight: 700, fontSize: '0.875rem' }}>
                    {p.name}: {typeof p.value === 'number' && p.value > 100 ? `$${p.value.toLocaleString()}` : p.value}
                </Typography>
            ))}
        </Box>
    );
};

// Pie label inside arc
const RADIAN = Math.PI / 180;
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.08) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/analytics').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const exportCSV = () => {
        if (!data?.fuelEfficiency) return;
        const hdr = 'Vehicle,Plate,Odometer,Liters,Fuel Cost,KM/Liter\n';
        const rows = data.fuelEfficiency.map(v => `${v.vehicleName},${v.licensePlate},${v.odometer},${v.totalLiters},${v.totalFuelCost},${v.kmPerLiter ?? 'N/A'}`).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([hdr + rows], { type: 'text/csv' }));
        a.download = 'fleet_analytics.csv'; a.click();
    };

    if (loading) return <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>Loading analytics…</Typography>;
    if (!data) return <Typography>Failed to load analytics.</Typography>;

    const [c1, c2] = PAGE_COLORS.analytics;
    const monthlyData = Object.entries(data.monthlyTrips || {}).map(([month, trips]) => ({ month, trips }));
    const costData = [
        { name: 'Fuel', value: data.costBreakdown?.fuel ?? 0 },
        { name: 'Maintenance', value: data.costBreakdown?.maintenance ?? 0 },
    ].filter(d => d.value > 0);

    return (
        <Box className="page-enter">
            {/* Hero */}
            <Box sx={{
                p: 3, mb: 3, borderRadius: 3.5,
                background: `linear-gradient(120deg, ${alpha(c1, 0.18)} 0%, ${alpha(c2, 0.1)} 60%, transparent 100%)`,
                border: `1px solid ${alpha(c1, 0.2)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2,
                flexWrap: 'wrap',
            }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.25 }}>Analytics</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Fleet performance insights</Typography>
                </Box>
                <Button variant="outlined" startIcon={<Download />} onClick={exportCSV}
                    sx={{ borderColor: alpha(c1, 0.5), color: c1, '&:hover': { borderColor: c1, bgcolor: alpha(c1, 0.08) } }}>
                    Export CSV
                </Button>
            </Box>

            {/* KPIs */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard title="Fleet Utilization" value={`${data.fleetUtilization}%`} icon={<Speed fontSize="inherit" />} color={PALETTE.violet} delay={0} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard title="Total Fuel Cost" value={`$${(data.costBreakdown?.fuel ?? 0).toLocaleString()}`} icon={<LocalGasStation fontSize="inherit" />} color={PALETTE.amber} delay={60} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard title="Maintenance Cost" value={`$${(data.costBreakdown?.maintenance ?? 0).toLocaleString()}`} icon={<TrendingUp fontSize="inherit" />} color={PALETTE.rose} delay={120} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard title="Top Driver" value={data.topDrivers?.[0]?.name ?? 'N/A'}
                        subtitle={`${data.topDrivers?.[0]?.completedTrips ?? 0} trips completed`}
                        icon={<EmojiEvents fontSize="inherit" />} color={PALETTE.emerald} delay={180} />
                </Grid>
            </Grid>

            {/* Charts row 1 */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {/* Area chart — monthly */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, height: 340 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Monthly Trip Volume</Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="tripGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={PALETTE.violet} stopOpacity={0.45} />
                                        <stop offset="95%" stopColor={PALETTE.violet} stopOpacity={0.03} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: '#7E8FA8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fill: '#7E8FA8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="trips" name="Trips" stroke={PALETTE.violet} strokeWidth={2.5} fill="url(#tripGrad)" dot={{ fill: PALETTE.violet, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: PALETTE.violet, stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Donut — cost breakdown */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, height: 340 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>Cost Breakdown</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <defs>
                                    {CHART_COLORS.map((c, i) => (
                                        <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={c} stopOpacity={1} />
                                            <stop offset="100%" stopColor={c} stopOpacity={0.7} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <Pie data={costData} cx="50%" cy="50%" innerRadius={58} outerRadius={95}
                                    dataKey="value" nameKey="name" paddingAngle={3}
                                    labelLine={false} label={renderPieLabel}>
                                    {costData.map((_, i) => <Cell key={i} fill={`url(#pieGrad${i})`} stroke="none" />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#7E8FA8', fontSize: 12 }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Fuel efficiency table */}
            <Paper sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Fuel Efficiency by Vehicle</Typography>
                <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Vehicle', 'Plate', 'Odometer (km)', 'Total Liters', 'Fuel Cost ($)', 'KM/Liter'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', color: '#7E8FA8', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.fuelEfficiency?.map((v, i) => (
                                <tr key={v.vehicleId} style={{ background: i % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#F1F5F9' }}>{v.vehicleName}</td>
                                    <td style={{ padding: '10px 14px', color: '#7E8FA8', fontFamily: 'monospace', fontSize: '0.85rem' }}>{v.licensePlate}</td>
                                    <td style={{ padding: '10px 14px' }}>{v.odometer?.toLocaleString()}</td>
                                    <td style={{ padding: '10px 14px' }}>{v.totalLiters?.toLocaleString()}</td>
                                    <td style={{ padding: '10px 14px' }}>${v.totalFuelCost?.toLocaleString()}</td>
                                    <td style={{ padding: '10px 14px', fontWeight: 800, color: v.kmPerLiter > 300 ? PALETTE.emerald : PALETTE.amber }}>
                                        {v.kmPerLiter ?? 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            </Paper>

            {/* Top drivers bar */}
            <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Top Drivers</Typography>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data.topDrivers ?? []} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="barGrad1" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={PALETTE.emerald} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={PALETTE.sky} stopOpacity={0.7} />
                            </linearGradient>
                            <linearGradient id="barGrad2" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={PALETTE.violet} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={PALETTE.indigo} stopOpacity={0.7} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#7E8FA8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fill: '#7E8FA8', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#7E8FA8', fontSize: 12 }}>{v}</span>} />
                        <Bar dataKey="completedTrips" name="Completed Trips" fill="url(#barGrad1)" radius={[0, 6, 6, 0]} barSize={10} />
                        <Bar dataKey="safetyScore" name="Safety Score" fill="url(#barGrad2)" radius={[0, 6, 6, 0]} barSize={10} />
                    </BarChart>
                </ResponsiveContainer>
            </Paper>
        </Box>
    );
}
