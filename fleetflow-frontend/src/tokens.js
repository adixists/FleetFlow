// ─── Global Design Tokens ────────────────────────────────────────────────────
// Single source of truth for colors used across theme, components, and charts.

export const PALETTE = {
    violet: '#7C6FFF',
    emerald: '#07EDB2',
    amber: '#F5A623',
    rose: '#FF4F7B',
    sky: '#38BDF8',
    indigo: '#818CF8',
};

// Recharts chart palette — in order of usage (bar 1, bar 2 … pie slices)
export const CHART_COLORS = [
    PALETTE.violet,
    PALETTE.emerald,
    PALETTE.amber,
    PALETTE.rose,
    PALETTE.sky,
    PALETTE.indigo,
];

// Gradient stop pairs [from, to] used with SVG linearGradient or CSS
export const GRADIENTS = {
    violet: ['#7C6FFF', '#4F46E5'],
    emerald: ['#07EDB2', '#059669'],
    amber: ['#F5A623', '#D97706'],
    rose: ['#FF4F7B', '#BE123C'],
    sky: ['#38BDF8', '#0284C7'],
    sidebar: ['#0C1428', '#080C18'],
    card: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)'],
};

// Status-to-color map shared by StatusChip and DataGrid rows
export const STATUS_COLORS = {
    // Vehicles
    available: { bg: 'rgba(7,237,178,0.15)', color: '#07EDB2', dot: '#07EDB2' },
    on_trip: { bg: 'rgba(56,189,248,0.15)', color: '#38BDF8', dot: '#38BDF8' },
    in_shop: { bg: 'rgba(245,166,35,0.15)', color: '#F5A623', dot: '#F5A623' },
    retired: { bg: 'rgba(148,163,184,0.1)', color: '#94A3B8', dot: '#94A3B8' },
    // Drivers
    on_duty: { bg: 'rgba(7,237,178,0.15)', color: '#07EDB2', dot: '#07EDB2' },
    off_duty: { bg: 'rgba(148,163,184,0.1)', color: '#94A3B8', dot: '#94A3B8' },
    suspended: { bg: 'rgba(255,79,123,0.15)', color: '#FF4F7B', dot: '#FF4F7B' },
    // Trips
    draft: { bg: 'rgba(148,163,184,0.1)', color: '#94A3B8', dot: '#94A3B8' },
    dispatched: { bg: 'rgba(56,189,248,0.15)', color: '#38BDF8', dot: '#38BDF8' },
    in_transit: { bg: 'rgba(129,140,248,0.15)', color: '#818CF8', dot: '#818CF8' },
    completed: { bg: 'rgba(7,237,178,0.15)', color: '#07EDB2', dot: '#07EDB2' },
    cancelled: { bg: 'rgba(255,79,123,0.15)', color: '#FF4F7B', dot: '#FF4F7B' },
};

// Page-level accent colors [primary, secondary] for page banner gradients
export const PAGE_COLORS = {
    dashboard: [PALETTE.violet, PALETTE.indigo],
    vehicles: [PALETTE.sky, '#0369A1'],
    trips: [PALETTE.emerald, '#059669'],
    maintenance: [PALETTE.rose, '#BE123C'],
    fuel: [PALETTE.amber, '#D97706'],
    drivers: [PALETTE.sky, PALETTE.indigo],
    analytics: [PALETTE.violet, PALETTE.emerald],
};
