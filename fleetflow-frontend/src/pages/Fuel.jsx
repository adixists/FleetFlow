import { useState, useEffect } from 'react';
import api from '../api/axios';
import KPICard from '../components/KPICard';
import {
    Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, MenuItem, Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, LocalGasStation } from '@mui/icons-material';
import { PALETTE, PAGE_COLORS } from '../tokens';
import { alpha } from '@mui/material/styles';

export default function Fuel() {
    const [data, setData] = useState({ logs: [], totalCost: 0, totalLiters: 0 });
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ vehicleId: '', liters: '', cost: '' });
    const [error, setError] = useState('');

    const fetch = async () => {
        setLoading(true);
        try {
            const [f, v] = await Promise.all([api.get('/fuel'), api.get('/vehicles')]);
            setData(f.data); setVehicles(v.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const handleSubmit = async () => {
        setError('');
        try { await api.post('/fuel', form); setOpen(false); setForm({ vehicleId: '', liters: '', cost: '' }); fetch(); }
        catch (e) { setError(e.response?.data?.error || 'Failed'); }
    };

    const [c1, c2] = PAGE_COLORS.fuel;

    const columns = [
        { field: 'id', headerName: '#', width: 60 },
        {
            field: 'vehicle', headerName: 'Vehicle', flex: 1, minWidth: 180,
            renderCell: p => <Box><Typography sx={{ fontWeight: 600 }}>{p.row.vehicle?.name}</Typography><Typography sx={{ fontSize: '0.72rem', fontFamily: 'monospace', color: PALETTE.sky }}>{p.row.vehicle?.licensePlate}</Typography></Box>
        },
        { field: 'liters', headerName: 'Liters', width: 100, renderCell: p => `${p.value} L` },
        { field: 'cost', headerName: 'Cost', width: 110, renderCell: p => <Typography sx={{ fontWeight: 700, color: PALETTE.amber }}>${p.value?.toLocaleString()}</Typography> },
        { field: 'cpl', headerName: '$/Liter', width: 100, renderCell: p => `$${(p.row.cost / p.row.liters).toFixed(2)}` },
        { field: 'date', headerName: 'Date', width: 130, renderCell: p => new Date(p.value).toLocaleDateString() },
    ];

    return (
        <Box className="page-enter">
            {/* Hero */}
            <Box sx={{
                p: 3, mb: 3, borderRadius: 3.5,
                background: `linear-gradient(120deg, ${alpha(c1, 0.18)} 0%, ${alpha(c2, 0.1)} 60%, transparent 100%)`,
                border: `1px solid ${alpha(c1, 0.2)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LocalGasStation sx={{ color: c1, fontSize: '1.8rem', filter: `drop-shadow(0 0 8px ${alpha(c1, 0.5)})` }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.1 }}>Fuel Logging</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Track consumption and costs</Typography>
                    </Box>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setError(''); setOpen(true); }}
                    sx={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                    Log Fuel
                </Button>
            </Box>

            {/* KPI summary */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}><KPICard title="Total Fuel Cost" value={`$${data.totalCost.toLocaleString()}`} icon={<LocalGasStation fontSize="inherit" />} color={PALETTE.amber} delay={0} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><KPICard title="Total Liters" value={data.totalLiters.toLocaleString()} icon={<LocalGasStation fontSize="inherit" />} color={PALETTE.sky} delay={60} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><KPICard title="Avg Cost / Liter" value={data.totalLiters > 0 ? `$${(data.totalCost / data.totalLiters).toFixed(2)}` : '—'} icon={<LocalGasStation fontSize="inherit" />} color={PALETTE.emerald} delay={120} /></Grid>
            </Grid>

            <Paper sx={{ borderRadius: 3 }}>
                <DataGrid rows={data.logs} columns={columns} loading={loading}
                    pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    disableRowSelectionOnClick autoHeight getRowHeight={() => 'auto'}
                    sx={{ border: 'none', borderRadius: 3, '& .MuiDataGrid-cell': { py: 1 } }} />
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Log Fuel</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth select label="Vehicle" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                                {vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.name} · {v.licensePlate}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Liters" type="number" value={form.liters} onChange={e => setForm({ ...form, liters: e.target.value })} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Cost ($)" type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>Log Fuel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
