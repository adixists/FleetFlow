import { useState, useEffect } from 'react';
import api from '../api/axios';
import StatusChip from '../components/StatusChip';
import {
    Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, MenuItem, Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';

export default function Maintenance() {
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ vehicleId: '', description: '', cost: '' });
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logsRes, vehiclesRes] = await Promise.all([
                api.get('/maintenance'), api.get('/vehicles'),
            ]);
            setLogs(logsRes.data);
            setVehicles(vehiclesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        setError('');
        try {
            await api.post('/maintenance', form);
            setDialogOpen(false);
            setForm({ vehicleId: '', description: '', cost: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create log');
        }
    };

    const totalCost = logs.reduce((s, l) => s + l.cost, 0);

    const columns = [
        { field: 'id', headerName: '#', width: 60 },
        {
            field: 'vehicle', headerName: 'Vehicle', flex: 1, minWidth: 180,
            renderCell: (p) => `${p.row.vehicle?.name} (${p.row.vehicle?.licensePlate})`
        },
        { field: 'description', headerName: 'Description', flex: 1.5, minWidth: 200 },
        {
            field: 'cost', headerName: 'Cost ($)', width: 110, type: 'number',
            renderCell: (p) => `$${p.value?.toLocaleString()}`
        },
        {
            field: 'date', headerName: 'Date', width: 140,
            renderCell: (p) => new Date(p.value).toLocaleDateString()
        },
        {
            field: 'vehicleStatus', headerName: 'Vehicle Status', width: 130,
            renderCell: (p) => <StatusChip status={p.row.vehicle?.status} />
        },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4">Maintenance Logs</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {logs.length} records · Total: ${totalCost.toLocaleString()}
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setError(''); setDialogOpen(true); }}
                    sx={{ background: 'linear-gradient(135deg, #FF5252, #FF7043)' }}>
                    Log Maintenance
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 3 }}>
                <DataGrid
                    rows={logs} columns={columns} loading={loading}
                    pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    disableRowSelectionOnClick autoHeight
                    sx={{
                        border: 'none', borderRadius: 3,
                        '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(255,82,82,0.08)' },
                        '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.04)' },
                    }}
                />
            </Paper>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}>
                <DialogTitle>Log Maintenance</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth select label="Vehicle" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                                {vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.name} ({v.licensePlate})</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Description" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Cost ($)" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ background: 'linear-gradient(135deg, #FF5252, #FF7043)' }}>
                        Log Entry
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
