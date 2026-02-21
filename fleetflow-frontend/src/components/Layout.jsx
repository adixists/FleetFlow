import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { alpha } from '@mui/material/styles';
import {
    Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
    AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem,
    Divider, useMediaQuery, useTheme, Tooltip,
} from '@mui/material';
import {
    Dashboard as DashboardIcon, DirectionsCar, Route, Build,
    LocalGasStation, People, Analytics, Logout, Menu as MenuIcon,
    KeyboardArrowDown,
} from '@mui/icons-material';
import { PALETTE } from '../tokens';

const drawerWidth = 258;

const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', color: PALETTE.violet },
    { text: 'Vehicles', icon: <DirectionsCar />, path: '/vehicles', color: PALETTE.sky },
    { text: 'Trips', icon: <Route />, path: '/trips', color: PALETTE.emerald, roles: ['manager', 'dispatcher'] },
    { text: 'Maintenance', icon: <Build />, path: '/maintenance', color: PALETTE.rose },
    { text: 'Fuel', icon: <LocalGasStation />, path: '/fuel', color: PALETTE.amber },
    { text: 'Drivers', icon: <People />, path: '/drivers', color: PALETTE.sky },
    { text: 'Analytics', icon: <Analytics />, path: '/analytics', color: PALETTE.indigo, roles: ['manager', 'analyst'] },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const filtered = navItems.filter(item => !item.roles || item.roles.includes(user?.role));

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {/* Subtle bg orb */}
            <Box sx={{
                position: 'absolute', top: '-60px', left: '-60px',
                width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,111,255,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Logo */}
            <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                    width: 38, height: 38, borderRadius: 2.5,
                    background: 'linear-gradient(135deg, #7C6FFF 0%, #07EDB2 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '1rem', color: '#fff',
                    boxShadow: '0 4px 14px rgba(124,111,255,0.4)',
                    flexShrink: 0,
                }}>FF</Box>
                <Box>
                    <Typography sx={{
                        fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.1,
                        backgroundImage: 'linear-gradient(135deg, #7C6FFF, #07EDB2)',
                        backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        FleetFlow
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Fleet ERP
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 2 }} />

            {/* Navigation */}
            <List sx={{ flex: 1, px: 1.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {filtered.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItemButton
                            key={item.path}
                            onClick={() => { navigate(item.path); setMobileOpen(false); }}
                            sx={{
                                borderRadius: 2.5, py: 1.1,
                                position: 'relative', overflow: 'hidden',
                                backgroundColor: isActive ? alpha(item.color, 0.12) : 'transparent',
                                border: isActive ? `1px solid ${alpha(item.color, 0.2)}` : '1px solid transparent',
                                // Left accent bar
                                '&::before': isActive ? {
                                    content: '""',
                                    position: 'absolute', left: 0, top: '20%',
                                    width: 3, height: '60%', borderRadius: '0 3px 3px 0',
                                    background: item.color,
                                    boxShadow: `2px 0 8px ${alpha(item.color, 0.5)}`,
                                } : {},
                                '&:hover': {
                                    backgroundColor: alpha(item.color, 0.08),
                                },
                                transition: 'all 0.18s ease',
                            }}
                        >
                            <ListItemIcon sx={{
                                minWidth: 36,
                                color: isActive ? item.color : 'text.secondary',
                                filter: isActive ? `drop-shadow(0 0 6px ${alpha(item.color, 0.6)})` : 'none',
                                transition: 'all 0.18s ease',
                                '& svg': { fontSize: '1.2rem' },
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: isActive ? 700 : 500,
                                    fontSize: '0.875rem',
                                    color: isActive ? item.color : 'text.secondary',
                                }}
                            />
                            {isActive && (
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: item.color, opacity: 0.8, mr: 0.5 }} />
                            )}
                        </ListItemButton>
                    );
                })}
            </List>

            {/* Bottom user section */}
            <Box sx={{ p: 1.5 }}>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 1.5 }} />
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.25,
                    borderRadius: 2.5,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: PALETTE.violet, fontSize: '0.8rem', fontWeight: 700 }}>
                        {user?.email?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.7rem', color: 'text.secondary', textTransform: 'capitalize' }}>
                            {user?.role?.replace('_', ' ')}
                        </Typography>
                    </Box>
                    <Tooltip title="Logout">
                        <IconButton size="small" onClick={() => { logout(); navigate('/login'); }} sx={{ color: 'text.secondary', '&:hover': { color: PALETTE.rose } }}>
                            <Logout fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    );

    const drawerSx = {
        '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: 'linear-gradient(180deg, #0C1428 0%, #080C18 100%)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
        },
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {isMobile ? (
                <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={drawerSx}>
                    {drawer}
                </Drawer>
            ) : (
                <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, ...drawerSx }}>
                    {drawer}
                </Drawer>
            )}

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top bar */}
                <AppBar position="sticky" elevation={0} sx={{
                    background: 'rgba(8,12,24,0.7)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    zIndex: (t) => t.zIndex.drawer - 1,
                }}>
                    <Toolbar sx={{ minHeight: '56px !important' }}>
                        {isMobile && (
                            <IconButton color="inherit" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Box sx={{ flex: 1 }} />
                        {/* Live status indicator */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                            <span className="live-dot" />
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Live</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ mr: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
                        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ gap: 1, borderRadius: 2, px: 1 }}>
                            <Avatar sx={{ width: 30, height: 30, bgcolor: PALETTE.violet, fontSize: '0.8rem', fontWeight: 700 }}>
                                {user?.email?.[0]?.toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', display: { xs: 'none', sm: 'block' } }}>
                                {user?.email}
                            </Typography>
                            <KeyboardArrowDown sx={{ color: 'text.secondary', fontSize: '1rem' }} />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                            PaperProps={{ sx: { mt: 1, minWidth: 160, border: '1px solid rgba(255,255,255,0.08)' } }}>
                            <MenuItem disabled sx={{ fontSize: '0.8rem', color: 'text.secondary', textTransform: 'capitalize' }}>
                                Role: {user?.role?.replace('_', ' ')}
                            </MenuItem>
                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                            <MenuItem onClick={() => { logout(); navigate('/login'); }} sx={{ fontSize: '0.875rem', gap: 1 }}>
                                <Logout fontSize="small" sx={{ color: PALETTE.rose }} /> Logout
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>

                <Box className="page-enter" sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
