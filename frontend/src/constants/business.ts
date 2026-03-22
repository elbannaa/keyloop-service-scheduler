export const SERVICE_TYPE = {
    NEW_CAR_CONSULTATION: 'NEW_CAR_CONSULTATION',
    VEHICLE_REPAIR: 'VEHICLE_REPAIR',
    VEHICLE_MAINTENANCE: 'VEHICLE_MAINTENANCE',
}

export const SERVICE_TYPE_LABELS = {
    [SERVICE_TYPE.NEW_CAR_CONSULTATION]: 'New Car Consultation',
    [SERVICE_TYPE.VEHICLE_REPAIR]: 'Vehicle Repair',
    [SERVICE_TYPE.VEHICLE_MAINTENANCE]: 'Vehicle Maintenance',
}

export const SERVICE_TYPE_OPTIONS = Object.entries(SERVICE_TYPE_LABELS).map(([key, value]) => ({
    value: key,
    label: value,
}))