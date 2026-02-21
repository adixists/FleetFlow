import { useState, useEffect } from 'react';
import api from '../api/axios';
import socket from '../api/socket';
import StatusChip from '../components/StatusChip';
import {
    Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, MenuItem, Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, CheckCircle, Cancel } from '@mui/icons-material';

export default function Trips() {
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [completeDialog, setCompleteDialog] = useState(null);
    const [endOdometer, setEndOdometer] = useState('');
    const [form, setForm] = useState({ vehicleId: '', driverId: '', cargoWeight: '', origin: '', destination: '' });
    const [error, setError] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
                api.get('/trips'), api.get('/vehicles'), api.get('/drivers'),
            ]);
            setTrips(tripsRes.data);
            setVehicles(vehiclesRes.data);
            setDrivers(driversRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        socket.on('statusUpdate', fetchAll);
        return () => socket.off('statusUpdate', fetchAll);
    }, []);

    const availableVehicles = vehicles.filter(v => v.status === 'available');
    const availableDrivers = drivers.filter(d => d.status === 'off_duty');

    const handleDispatch = async () => {
        setError('');
        try {
            await api.post('/trips', {
                vehicleId: parseInt(form.vehicleId),
                driverId: parseInt(form.driverId),
                cargoWeight: parseFloat(form.cargoWeight),
                origin: form.origin,
                destination: form.destination,
            });
            setDialogOpen(false);
            setForm({ vehicleId: '', driverId: '', cargoWeight: '', origin: '', destination: '' });
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to dispatch trip');
        }
    };

    const handleComplete = async () => {
        try {
            await api.put(`/trips/${completeDialog.id}`, { state: 'completed', endOdometer: parseFloat(endOdometer) });
            setCompleteDialog(null);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to complete trip');
        }
    };

    const handleCancel = async (tripId) => {
        if (!window.confirm('Cancel this trip?')) return;
        try {
            await api.put(`/trips/${tripId}`, { state: 'cancelled' });
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to cancel trip');
        }
    };

    const columns = [
        { field: 'id', headerName: 'Trip #', width: 80 },
        {
            field: 'vehicle', headerName: 'Vehicle', flex: 1, minWidth: 150,
            renderCell: (p) => `${p.row.vehicle?.name} (${p.row.vehicle?.licensePlate})`
        },
        {
            field: 'driver', headerName: 'Driver', flex: 1, minWidth: 120,
            renderCell: (p) => p.row.driver?.name
        },
        { field: 'origin', headerName: 'Origin', width: 140 },
        { field: 'destination', headerName: 'Destination', width: 140 },
        {
            field: 'cargoWeight', headerName: 'Cargo (kg)', width: 110, type: 'number',
            renderCell: (p) => p.value?.toLocaleString()
        },
        {
            field: 'state', headerName: 'Status', width: 130,
            renderCell: (p) => <StatusChip status={p.value} />
        },
        {
            field: 'actions', headerName: 'Actions', width: 130, sortable: false,
            renderCell: (p) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {p.row.state === 'dispatched' && (
                        <>
                            <Button size="small" color="success" startIcon={<CheckCircle />}
                                onClick={() => { setCompleteDialog(p.row); setEndOdometer(''); }}
                                sx={{ fontSize: '0.7rem', minWidth: 0 }}>Done</Button>
                            <Button size="small" color="error" startIcon={<Cancel />}
                                onClick={() => handleCancel(p.row.id)}
                                sx={{ fontSize: '0.7rem', minWidth: 0 }}>X</Button>
                        </>
                    )}
                </Box>
            ),
        },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4">Trip Dispatcher</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {trips.filter(t => t.state === 'dispatched').length} active trips
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setError(''); setDialogOpen(true); }}
                    sx={{ background: 'linear-gradient(135deg, #6C63FF, #8B83FF)' }}>
                    Dispatch Trip
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 3 }}>
                <DataGrid
                    rows={trips} columns={columns} loading={loading}
                    pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    disableRowSelectionOnClick autoHeight
                    sx={{
                        border: 'none', borderRadius: 3,
                        '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(0,217,166,0.08)' },
                        '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.04)' },
                        '& .MuiDataGrid-row:hover': { bgcolor: 'rgba(0,217,166,0.04)' },
                    }}
                />
            </Paper>

            {/* Dispatch Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}>
                <DialogTitle>Dispatch New Trip</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth select label="Vehicle" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                                {availableVehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.name} ({v.licensePlate})</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth select label="Driver" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                                {availableDrivers.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Cargo Weight (kg)" type="number" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleDispatch}
                        sx={{ background: 'linear-gradient(135deg, #00D9A6, #33E3BD)' }}>
                        Dispatch
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Complete Dialog */}
            <Dialog open={!!completeDialog} onClose={() => setCompleteDialog(null)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}>
                <DialogTitle>Complete Trip #{completeDialog?.id}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Enter the ending odometer reading to complete this trip.
                    </Typography>
                    <TextField fullWidth label="End Odometer (km)" type="number" value={endOdometer}
                        onChange={(e) => setEndOdometer(e.target.value)}
                        helperText={`Start odometer: ${completeDialog?.startOdometer?.toLocaleString() || 'N/A'} km`} />
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setCompleteDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleComplete}>Complete Trip</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
