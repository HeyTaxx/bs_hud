Config = {}
-- Made by Hey Tax
-- (c) 2024-2026 Blue Style Development. All rights reserved. bluestyle.dev

Config.UpdateInterval = 200

Config.HideOnAiming = true
Config.HideOnDeath = true
Config.HideOnPause = true

Config.EnableSpeedometer = true
Config.UseKMH = true

Config.EnableStress = true
Config.StressMultipliers = {
    shooting = 0.5,
    beingShot = 1.0,
    speeding = 0.1,
    crash = 2.0,
}
Config.StressRelief = {
    walking = 0.05,
    eating = 5.0,
    drinking = 3.0,
}

Config.MinimapOnFoot = true
Config.MinimapInVehicle = true

Config.EnableSeatbelt = true
Config.SeatbeltKey = 303  -- B key (INPUT_REPLAY_MARKER_DELETE)

Config.Framework = 'esx' -- 'esx' or 'qb'

Config.EnableOxygen = true
Config.EnableNitro = true
Config.EnableWeaponHUD = true

Config.MapShape = 'circle' -- 'circle' or 'square'

Config.Locales = {
    ['job_unemployed'] = 'Unemployed',
    ['seatbelt_on'] = 'Belted',
    ['seatbelt_off'] = 'Not Belted',
    ['voice_whisper'] = 'Whisper',
    ['voice_normal'] = 'Normal',
    ['voice_shout'] = 'Shout',
    ['speedo_kmh'] = 'KM/H',
    ['speedo_mph'] = 'MPH',
    ['speedo_gear'] = 'GEAR',
    ['speedo_fuel'] = 'TANK',
    ['id_label'] = 'ID',
    ['waypoint_gps'] = 'GPS'
}
