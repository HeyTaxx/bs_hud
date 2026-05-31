Config = {}
-- Made by Hey Tax
-- (c) 2024-2026 Blue Style Development. All rights reserved. bluestyle.dev

-- Update-Intervall in Millisekunden
Config.UpdateInterval = 200

-- HUD ausblenden beim Zielen
Config.HideOnAiming = true

-- HUD ausblenden bei Tod
Config.HideOnDeath = true

-- HUD ausblenden im Pausemenü
Config.HideOnPause = true

-- Speedometer aktivieren (nur in Fahrzeugen)
Config.EnableSpeedometer = true

-- Geschwindigkeit in km/h (true) oder mph (false)
Config.UseKMH = true

-- Stress-System aktivieren
Config.EnableStress = true

-- Stress erhöht sich bei:
Config.StressMultipliers = {
    shooting = 0.5,       -- Pro Schuss
    beingShot = 1.0,      -- Wenn man getroffen wird
    speeding = 0.1,       -- Über 120 km/h
    crash = 2.0,          -- Bei Unfall
}

-- Stress verringert sich bei:
Config.StressRelief = {
    walking = 0.05,       -- Beim Laufen
    eating = 5.0,         -- Beim Essen
    drinking = 3.0,       -- Beim Trinken
}

-- Minimap-Einstellungen
Config.MinimapOnFoot = true  -- Minimap zu Fuß anzeigen (für bessere HUD-Ausrichtung)
Config.MinimapInVehicle = true -- Minimap im Fahrzeug zeigen

-- Seatbelt (Anschnallgurt)
Config.EnableSeatbelt = true
Config.SeatbeltKey = 303  -- B-Taste (INPUT_REPLAY_MARKER_DELETE)

-- Framework (ESX oder QB)
Config.Framework = 'esx' -- 'esx' oder 'qb'

-- Erweiterte Indikatoren
Config.EnableOxygen = true
Config.EnableNitro = true
Config.EnableWeaponHUD = true

-- Minimap Form
Config.MapShape = 'circle' -- 'circle' oder 'square'

-- Locales (Sprachdateien)
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
