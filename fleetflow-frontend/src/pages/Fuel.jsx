import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, MenuItem, Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, LocalGasStation } from '@mui/icons-material';
import KPICard from '../components/KPICard';

export default function Fuel() {
    const [data, setData] = useState({ logs: [], totalCost: 0, totalLiters: 0 });
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ vehicleId: '', liters: '', cost: '' });
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fuelRes, vehiclesRes] = await Promise.all([
                api.get('/fuel'), api.get('/vehicles'),
            ]);
            setData(fuelRes.data);
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
            await api.post('/fuel', form);
            setDialogOpen(false);
            setForm({ vehicleId: '', liters: '', cost: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to log fuel');
        }
    };

    const columns = [
        { field: 'id', headerName: '#', width: 60 },
        {
            field: 'vehicle', headerName: 'Vehicle', flex: 1, minWidth: 180,
            renderCell: (p) => `${p.row.vehicle?.name} (${p.row.vehicle?.licensePlate})`
        },
        { field: 'liters', headerName: 'Liters', width: 100, type: 'number' },
        {
            field: 'cost', headerName: 'Cost ($)', width: 110, type: 'number',
            renderCell: (p) => `$${p.value?.toLocaleString()}`
        },
        {
            field: 'costPerLiter', headerName: '$/Liter', width: 100,
            renderCell: (p) => `$${(p.row.cost / p.row.liters).toFixed(2)}`
        },
        {
            field: 'date', headerName: 'Date', width: 140,
            renderCell: (p) => new Date(p.value).toLocaleDateString()
        },
    ];

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 0.5 }}>Fuel Logging</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Track fuel consumption and costs
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <KPICard title="Total Fuel Cost" value={`$${data.totalCost.toLocaleString()}`} icon={<LocalGasStation fontSize="inherit" />} color="#FFB74D" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <KPICard title="Total Liters" value={data.totalLiters.toLocaleString()} icon={<LocalGasStation fontSize="inherit" />} color="#29B6F6" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <KPICard title="Avg Cost/Liter" value={data.totalLiters > 0 ? `$${(data.totalCost / data.totalLiters).toFixed(2)}` : 'N/A'} icon={<LocalGasStation fontSize="inherit" />} color="#00D9A6" />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setError(''); setDialogOpen(true); }}
                    sx={{ background: 'linear-gradient(135deg, #FFB74D, #FFA726)' }}>
                    Log Fuel
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 3 }}>
                <DataGrid
                    rows={data.logs} columns={columns} loading={loading}
                    pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    disableRowSelectionOnClick autoHeight
                    sx={{
                        border: 'none', borderRadius: 3,
                        '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(255,183,77,0.08)' },
                        '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.04)' },
                    }}
                />
            </Paper>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}>
                <DialogTitle>Log Fuel</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth select label="Vehicle" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                                {vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.name} ({v.licensePlate})</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Liters" type="number" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Cost ($)" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ background: 'linear-gradient(135deg, #FFB74D, #FFA726)' }}>Log Fuel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
