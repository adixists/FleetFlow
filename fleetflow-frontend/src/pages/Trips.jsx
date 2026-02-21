import { useState, useEffect } from 'react';
import api from '../api/axios';
import socket from '../api/socket';
import StatusChip from '../components/StatusChip';
import {
    Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, MenuItem, Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, CheckCircle, Cancel, Route } from '@mui/icons-material';
import { PALETTE, PAGE_COLORS } from '../tokens';
import { alpha } from '@mui/material/styles';

export default function Trips() {
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [completeTrip, setCompleteTrip] = useState(null);
    const [endOdo, setEndOdo] = useState('');
    const [form, setForm] = useState({ vehicleId: '', driverId: '', cargoWeight: '', origin: '', destination: '' });
    const [error, setError] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [t, v, d] = await Promise.all([api.get('/trips'), api.get('/vehicles'), api.get('/drivers')]);
            setTrips(t.data); setVehicles(v.data); setDrivers(d.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); socket.on('statusUpdate', fetchAll); return () => socket.off('statusUpdate', fetchAll); }, []);

    const avVehicles = vehicles.filter(v => v.status === 'available');
    const avDrivers = drivers.filter(d => d.status === 'off_duty');

    const handleDispatch = async () => {
        setError('');
        try {
            await api.post('/trips', { vehicleId: +form.vehicleId, driverId: +form.driverId, cargoWeight: +form.cargoWeight, origin: form.origin, destination: form.destination });
            setOpen(false); setForm({ vehicleId: '', driverId: '', cargoWeight: '', origin: '', destination: '' }); fetchAll();
        } catch (e) { setError(e.response?.data?.error || 'Failed to dispatch'); }
    };

    const handleComplete = async () => {
        try { await api.put(`/trips/${completeTrip.id}`, { state: 'completed', endOdometer: +endOdo }); setCompleteTrip(null); fetchAll(); }
        catch (e) { alert(e.response?.data?.error || 'Failed'); }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this trip?')) return;
        try { await api.put(`/trips/${id}`, { state: 'cancelled' }); fetchAll(); }
        catch (e) { alert(e.response?.data?.error || 'Failed'); }
    };

    const [c1, c2] = PAGE_COLORS.trips;

    const columns = [
        { field: 'id', headerName: '#', width: 60, renderCell: p => <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>#{p.value}</Typography> },
        { field: 'vehicle', headerName: 'Vehicle', flex: 1, minWidth: 150, renderCell: p => <Box><Typography sx={{ fontWeight: 600, lineHeight: 1.2 }}>{p.row.vehicle?.name}</Typography><Typography sx={{ color: PALETTE.sky, fontSize: '0.72rem', fontFamily: 'monospace' }}>{p.row.vehicle?.licensePlate}</Typography></Box> },
        { field: 'driver', headerName: 'Driver', flex: 1, minWidth: 120, renderCell: p => p.row.driver?.name },
        { field: 'origin', headerName: 'Origin → Destination', flex: 1.5, minWidth: 200, renderCell: p => <Typography sx={{ fontSize: '0.85rem' }}>{p.row.origin || '—'} → {p.row.destination || '—'}</Typography> },
        { field: 'cargoWeight', headerName: 'Cargo', width: 110, renderCell: p => `${p.value?.toLocaleString()} kg` },
        { field: 'state', headerName: 'Status', width: 140, renderCell: p => <StatusChip status={p.value} /> },
        {
            field: 'actions', headerName: 'Actions', width: 140, sortable: false,
            renderCell: p => p.row.state === 'dispatched' ? (
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Button size="small" variant="contained" color="success" onClick={() => { setCompleteTrip(p.row); setEndOdo(''); }}
                        sx={{ fontSize: '0.72rem', py: 0.4, px: 1, minWidth: 0 }}>Done</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleCancel(p.row.id)}
                        sx={{ fontSize: '0.72rem', py: 0.4, px: 1, minWidth: 0 }}>Cancel</Button>
                </Box>
            ) : null,
        },
    ];

    return (
        <Box className="page-enter">
            <Box sx={{
                p: 3, mb: 3, borderRadius: 3.5,
                background: `linear-gradient(120deg, ${alpha(c1, 0.18)} 0%, ${alpha(c2, 0.1)} 60%, transparent 100%)`,
                border: `1px solid ${alpha(c1, 0.2)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Route sx={{ color: c1, fontSize: '1.8rem', filter: `drop-shadow(0 0 8px ${alpha(c1, 0.5)})` }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.1 }}>Trip Dispatcher</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{trips.filter(t => t.state === 'dispatched').length} active trips</Typography>
                    </Box>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setError(''); setOpen(true); }}
                    sx={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                    Dispatch Trip
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 3 }}>
                <DataGrid rows={trips} columns={columns} loading={loading}
                    pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    disableRowSelectionOnClick autoHeight getRowHeight={() => 'auto'}
                    sx={{ border: 'none', borderRadius: 3, '& .MuiDataGrid-cell': { py: 1 } }} />
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Dispatch New Trip</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth select label="Vehicle (available)" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                                {avVehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.name} · {v.licensePlate}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth select label="Driver (off-duty)" value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })}>
                                {avDrivers.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Cargo Weight (kg)" type="number" value={form.cargoWeight} onChange={e => setForm({ ...form, cargoWeight: e.target.value })} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Origin" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} /></Grid>
                        <Grid size={{ xs: 12 }}><TextField fullWidth label="Destination" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleDispatch} sx={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>Dispatch</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!completeTrip} onClose={() => setCompleteTrip(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Complete Trip #{completeTrip?.id}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>Enter the ending odometer reading.</Typography>
                    <TextField fullWidth label="End Odometer (km)" type="number" value={endOdo} onChange={e => setEndOdo(e.target.value)}
                        helperText={`Start: ${completeTrip?.startOdometer?.toLocaleString() ?? 'N/A'} km`} />
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setCompleteTrip(null)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleComplete}>Complete Trip</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
