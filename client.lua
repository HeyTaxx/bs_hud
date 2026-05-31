local Framework = Config.Framework or 'esx'
local ESX = nil
local QBCore = nil

if Framework == 'qb' then
    QBCore = exports['qb-core']:GetCoreObject()
else
    ESX = exports['es_extended']:getSharedObject()
end

local playerData = {}
local isHudVisible = true
local isInVehicle = false
local isSeatbeltOn = false
local currentStress = 0
local lastHealth = 200
local wasShooting = false

local lastData = {}
local currentVoiceRange = 'normal'

CreateThread(function()
    Wait(1000)
    DisplayRadar(false)

    if Framework == 'esx' then
        while ESX.GetPlayerData().job == nil do Wait(100) end
        playerData = ESX.GetPlayerData()
    elseif Framework == 'qb' then
        while QBCore.Functions.GetPlayerData().job == nil do Wait(100) end
        playerData = QBCore.Functions.GetPlayerData()
    end
    
    if Config.MapShape == 'circle' then
        SetMinimapClipType(1)
        SetMinimapComponentPosition("minimap", "L", "B", 0.025, -0.05, 0.153, 0.24)
        SetMinimapComponentPosition("minimap_mask", "L", "B", 0.045, -0.015, 0.111, 0.159)
        SetMinimapComponentPosition("minimap_blur", "L", "B", 0.012, 0.02, 0.256, 0.337)
    else
        SetMinimapClipType(0)
    end

    SendNUIMessage({ type = 'initData', locales = Config.Locales })
    SendNUIMessage({ type = 'toggleHud', show = true })
end)

RegisterNetEvent('esx:playerLoaded')
AddEventHandler('esx:playerLoaded', function(xPlayer)
    if Framework == 'esx' then playerData = xPlayer end
end)

RegisterNetEvent('esx:setJob')
AddEventHandler('esx:setJob', function(job)
    if Framework == 'esx' then playerData.job = job end
end)

RegisterNetEvent('esx:setAccountMoney')
AddEventHandler('esx:setAccountMoney', function(account)
    if Framework == 'esx' and playerData.accounts then
        for i=1, #playerData.accounts, 1 do
            if playerData.accounts[i].name == account.name then
                playerData.accounts[i] = account
                break
            end
        end
    end
end)

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    if Framework == 'qb' then playerData = QBCore.Functions.GetPlayerData() end
end)

RegisterNetEvent('QBCore:Client:OnJobUpdate', function(JobInfo)
    if Framework == 'qb' then playerData.job = JobInfo end
end)

RegisterNetEvent('QBCore:Player:SetPlayerData', function(val)
    if Framework == 'qb' then playerData = val end
end)

local currentHunger, currentThirst = 100, 100
CreateThread(function()
    while true do
        TriggerEvent('esx_status:getStatus', 'hunger', function(status)
            if status then currentHunger = math.floor(status.getPercent()) end
        end)
        TriggerEvent('esx_status:getStatus', 'thirst', function(status)
            if status then currentThirst = math.floor(status.getPercent()) end
        end)
        Wait(1000)
    end
end)

CreateThread(function()
    local lastInVehicle = false
    local lastRadarState = false

    while true do
        Wait(Config.UpdateInterval)

        local ped = PlayerPedId()
        if not ped or ped == 0 then goto continue end

        local maxHealth = GetEntityMaxHealth(ped)
        local health = GetEntityHealth(ped)
        local displayHealth = 0
        
        if maxHealth > 100 then
            displayHealth = math.floor(((health - 100) / (maxHealth - 100)) * 100)
        else
            displayHealth = math.floor((health / maxHealth) * 100)
        end

        local armor = GetPedArmour(ped)
        local isDead = IsEntityDead(ped)
        local isPaused = IsPauseMenuActive()
        local isAiming = IsPlayerFreeAiming(PlayerId())

        local shouldShow = true
        if Config.HideOnDeath and isDead then shouldShow = false end
        if Config.HideOnPause and isPaused then shouldShow = false end
        if Config.HideOnAiming and isAiming then shouldShow = false end

        if shouldShow ~= isHudVisible then
            isHudVisible = shouldShow
            SendNUIMessage({ type = 'toggleHud', show = shouldShow })
        end

        if not shouldShow then 
            if lastRadarState then
                DisplayRadar(false)
                lastRadarState = false
            end
            goto continue 
        end

        local inVehicle = IsPedInAnyVehicle(ped, false)
        if inVehicle ~= isInVehicle then
            isInVehicle = inVehicle
            if not inVehicle then
                isSeatbeltOn = false
                SendNUIMessage({ type = 'seatbelt', active = false })
                SetPedConfigFlag(ped, 32, true)
            else
                SetPedConfigFlag(ped, 32, true)
            end
        end

        local currentRadarState = false
        if Config.MinimapInVehicle and inVehicle then
            currentRadarState = true
        elseif Config.MinimapOnFoot and not inVehicle then
            currentRadarState = true
        end

        if currentRadarState ~= lastRadarState then
            DisplayRadar(currentRadarState)
            lastRadarState = currentRadarState
        end

        local speed = 0
        local rpm = 0
        local gear = 0
        local fuel = 0
        local lightsOn = false
        local engineHealth = 100
        local cruiseOn = false
        if inVehicle then
            local vehicle = GetVehiclePedIsIn(ped, false)
            if Config.UseKMH then
                speed = math.floor(GetEntitySpeed(vehicle) * 3.6)
            else
                speed = math.floor(GetEntitySpeed(vehicle) * 2.236936)
            end
            rpm = GetVehicleCurrentRpm(vehicle)
            gear = GetVehicleCurrentGear(vehicle)
            fuel = GetVehicleFuelLevel(vehicle)

            local _, lights, highbeams = GetVehicleLightsState(vehicle)
            lightsOn = (lights == 1 or highbeams == 1)
            engineHealth = GetVehicleEngineHealth(vehicle) / 10.0
            cruiseOn = (GetVehicleMaxSpeed(vehicle) < 1000.0)
        end

        if Config.EnableStress then
            local hNormal = health - 100
            if hNormal < lastHealth then
                currentStress = math.min(100, currentStress + Config.StressMultipliers.beingShot)
            end
            lastHealth = hNormal

            if IsPedShooting(ped) and not wasShooting then
                currentStress = math.min(100, currentStress + Config.StressMultipliers.shooting)
                wasShooting = true
            elseif not IsPedShooting(ped) then
                wasShooting = false
            end

            if inVehicle and speed > (Config.UseKMH and 120 or 75) then
                currentStress = math.min(100, currentStress + Config.StressMultipliers.speeding)
            end

            if IsPedWalking(ped) or IsPedRunning(ped) then
                currentStress = math.max(0, currentStress - Config.StressRelief.walking)
            end
            currentStress = math.max(0, currentStress - 0.01)
        end

        local coords = GetEntityCoords(ped)
        local s1, s2 = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
        local street = GetStreetNameFromHashKey(s1)
        if s2 ~= 0 then street = street .. " | " .. GetStreetNameFromHashKey(s2) end
        local zone = GetLabelText(GetNameOfZone(coords.x, coords.y, coords.z))
        local heading = GetEntityHeading(ped)

        local waypointDist = -1
        local waypointBlip = GetFirstBlipInfoId(8)
        if DoesBlipExist(waypointBlip) then
            local wpCoords = GetBlipCoords(waypointBlip)
            waypointDist = math.floor(#(coords - wpCoords))
        end

        local cash, bank, blackMoney = 0, 0, 0
        local jobName = Config.Locales['job_unemployed']
        local jobRank = ""

        if Framework == 'esx' then
            if playerData.accounts then
                for k,v in ipairs(playerData.accounts) do
                    if v.name == 'money' then cash = v.money
                    elseif v.name == 'bank' then bank = v.money
                    elseif v.name == 'black_money' then blackMoney = v.money
                    end
                end
            end
            jobName = (playerData.job and playerData.job.label) or Config.Locales['job_unemployed']
            jobRank = (playerData.job and playerData.job.grade_label) or ""
        elseif Framework == 'qb' then
            if playerData.money then
                cash = playerData.money.cash or 0
                bank = playerData.money.bank or 0
                blackMoney = playerData.money.crypto or 0
            end
            jobName = (playerData.job and playerData.job.label) or Config.Locales['job_unemployed']
            jobRank = (playerData.job and playerData.job.grade and playerData.job.grade.name) or ""
        end

        local myId = GetPlayerServerId(PlayerId())

        local oxygen = 100
        if Config.EnableOxygen and IsPedSwimmingUnderWater(ped) then
            oxygen = math.floor(GetPlayerUnderwaterTimeRemaining(PlayerId()) * 10)
        end

        local nitroActive = false
        if Config.EnableNitro and inVehicle then
        end

        local weaponHash = 0
        local weaponAmmo = 0
        local hasWeapon = false
        if Config.EnableWeaponHUD then
            local wpn = GetSelectedPedWeapon(ped)
            if wpn ~= `WEAPON_UNARMED` and wpn ~= 0 then
                hasWeapon = true
                weaponHash = wpn
                weaponAmmo = GetAmmoInPedWeapon(ped, wpn)
            end
        end

        local newData = {
            health = math.max(0, displayHealth),
            armor = armor,
            hunger = currentHunger,
            thirst = currentThirst,
            stress = math.floor(currentStress),
            oxygen = oxygen,
            inVehicle = inVehicle,
            speed = speed,
            rpm = rpm,
            gear = gear,
            fuel = math.floor(fuel),
            nitro = nitroActive,
            street = street,
            zone = zone,
            heading = math.floor(heading),
            lights = lightsOn,
            engine = engineHealth,
            cruise = cruiseOn,
            waypoint = waypointDist,
            cash = cash,
            bank = bank,
            blackMoney = blackMoney,
            jobName = jobName,
            jobRank = jobRank,
            playerId = myId,
            hasWeapon = hasWeapon,
            weaponAmmo = weaponAmmo
        }

        local shouldUpdate = false
        if not lastData.health or math.abs(newData.health - (lastData.health or 0)) > 1 then shouldUpdate = true end
        if newData.armor ~= lastData.armor then shouldUpdate = true end
        if newData.hunger ~= lastData.hunger then shouldUpdate = true end
        if newData.thirst ~= lastData.thirst then shouldUpdate = true end
        if newData.stress ~= lastData.stress then shouldUpdate = true end
        if newData.oxygen ~= lastData.oxygen then shouldUpdate = true end
        if newData.inVehicle ~= lastData.inVehicle then shouldUpdate = true end
        if newData.hasWeapon ~= lastData.hasWeapon then shouldUpdate = true end
        if newData.weaponAmmo ~= lastData.weaponAmmo then shouldUpdate = true end
        
        if newData.inVehicle then
            if math.abs(newData.speed - (lastData.speed or 0)) > 1 then shouldUpdate = true end
            if math.abs(newData.fuel - (lastData.fuel or 0)) > 1 then shouldUpdate = true end
            if newData.gear ~= lastData.gear then shouldUpdate = true end
            if math.abs(newData.rpm - (lastData.rpm or 0)) > 0.05 then shouldUpdate = true end
            if newData.lights ~= lastData.lights then shouldUpdate = true end
            if newData.engine ~= lastData.engine then shouldUpdate = true end
            if newData.cruise ~= lastData.cruise then shouldUpdate = true end
            if newData.nitro ~= lastData.nitro then shouldUpdate = true end
        end
        if newData.street ~= lastData.street then shouldUpdate = true end
        if math.abs(newData.heading - (lastData.heading or 0)) > 2 then shouldUpdate = true end
        if math.abs(newData.waypoint - (lastData.waypoint or -1)) > 10 then shouldUpdate = true end
        
        if newData.cash ~= lastData.cash then shouldUpdate = true end
        if newData.bank ~= lastData.bank then shouldUpdate = true end
        if newData.blackMoney ~= lastData.blackMoney then shouldUpdate = true end
        if newData.jobName ~= lastData.jobName then shouldUpdate = true end
        if newData.jobRank ~= lastData.jobRank then shouldUpdate = true end

        if shouldUpdate then
            lastData = newData
            newData.type = 'updateHud'
            SendNUIMessage(newData)
        end

        ::continue::
    end
end)

if Config.EnableSeatbelt then
    RegisterKeyMapping('+bs_seatbelt', 'Anschnallgurt an/aus', 'keyboard', 'b')
    RegisterCommand('+bs_seatbelt', function()
        if not isInVehicle then return end
        local ped = PlayerPedId()
        isSeatbeltOn = not isSeatbeltOn
        SendNUIMessage({ type = 'seatbelt', active = isSeatbeltOn })
        PlaySoundFrontend(-1, "NAV_UP_DOWN", "HUD_FRONTEND_DEFAULT_SOUNDSET", true)
        SetPedConfigFlag(ped, 32, not isSeatbeltOn)
        
        if isSeatbeltOn then
            ESX.ShowNotification("~g~Anschnallgurt angelegt")
        else
            ESX.ShowNotification("~r~Anschnallgurt abgelegt")
        end
    end, false)

    CreateThread(function()
        local lastSpeed = 0
        while true do
            Wait(100)
            if isInVehicle and not isSeatbeltOn then
                local ped = PlayerPedId()
                local vehicle = GetVehiclePedIsIn(ped, false)
                local speed = GetEntitySpeed(vehicle) * 3.6
                local speedDiff = lastSpeed - speed

                if speedDiff > 40 and lastSpeed > 40 then
                    local fwd = GetEntityForwardVector(vehicle)
                    local throwVel = math.min(speedDiff / 3.6, 50.0)
                    SetPedToRagdoll(ped, 3000, 3000, 0, true, true, false)
                    SetEntityVelocity(ped, fwd.x * throwVel, fwd.y * throwVel, fwd.z * throwVel + 2.0)
                    TaskLeaveVehicle(ped, vehicle, 4160)
                    currentStress = math.min(100, currentStress + Config.StressMultipliers.crash)
                    ApplyDamageToPed(ped, math.floor(speedDiff * 0.5), false)
                elseif speedDiff > 20 and lastSpeed > 20 then
                    ShakeGameplayCam('SMALL_EXPLOSION_SHAKE', 0.3)
                    currentStress = math.min(100, currentStress + Config.StressMultipliers.crash * 0.5)
                end
                lastSpeed = speed
            elseif isInVehicle then
                local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
                lastSpeed = GetEntitySpeed(vehicle) * 3.6
            else
                lastSpeed = 0
                Wait(500)
            end
        end
    end)
end

RegisterNetEvent('bs_hud:addStress')
AddEventHandler('bs_hud:addStress', function(amount)
    currentStress = math.min(100, currentStress + amount)
end)

RegisterNetEvent('bs_hud:removeStress')
AddEventHandler('bs_hud:removeStress', function(amount)
    currentStress = math.max(0, currentStress - amount)
end)

local lastHungerTick, lastThirstTick = 100, 100

local function statusToPercent(status)
    if type(status.getPercent) == 'function' then
        return math.floor(status.getPercent())
    elseif status.maxVal and status.maxVal > 0 then
        return math.floor((status.val / status.maxVal) * 100)
    end
    return 0
end

AddEventHandler('esx_status:onTick', function(statuses)
    for _, status in ipairs(statuses) do
        if status.name == 'hunger' then
            local val = statusToPercent(status)
            if val > lastHungerTick then
                currentStress = math.max(0, currentStress - Config.StressRelief.eating)
            end
            lastHungerTick = val
        elseif status.name == 'thirst' then
            local val = statusToPercent(status)
            if val > lastThirstTick then
                currentStress = math.max(0, currentStress - Config.StressRelief.drinking)
            end
            lastThirstTick = val
        end
    end
end)

exports('GetStress', function()
    return currentStress
end)

exports('SetStress', function(value)
    currentStress = math.max(0, math.min(100, value))
end)

exports('IsHudVisible', function()
    return isHudVisible
end)

local function updateVoiceMode(modeIndex)
    if type(modeIndex) ~= 'number' then return end
    local mode
    if modeIndex == 1 then
        mode = 'whisper'
    elseif modeIndex >= 3 then
        mode = 'shout'
    else
        mode = 'normal'
    end
    if mode ~= currentVoiceRange then
        currentVoiceRange = mode
        SendNUIMessage({ type = 'voiceRange', mode = mode })
    end
end

AddEventHandler('pma-voice:setTalkingMode', function(newTalkingRange)
    updateVoiceMode(newTalkingRange)
end)

RegisterCommand('hud', function()
    SendNUIMessage({ type = 'openSettings' })
    SetNuiFocus(true, true)
end, false)

RegisterNUICallback('closeSettings', function(data, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

exports('IsSeatbeltOn', function()
    return isSeatbeltOn
end)

local function SendNotification(type, message, time)
    SendNUIMessage({
        type = 'notify',
        notifyType = type or 'normal',
        message = message,
        time = time or 5000
    })
end

exports('Notify', SendNotification)

RegisterNetEvent('bs_hud:notify')
AddEventHandler('bs_hud:notify', function(type, message, time)
    SendNotification(type, message, time)
end)

RegisterNetEvent('esx:showNotification')
AddEventHandler('esx:showNotification', function(text, type, length)
    local nType = 'normal'
    if type == 'error' or type == '~r~' then nType = 'error'
    elseif type == 'success' or type == '~g~' then nType = 'success'
    end
    SendNotification(nType, text, length)
end)

RegisterNetEvent('QBCore:Notify')
AddEventHandler('QBCore:Notify', function(text, type, length)
    local nType = 'normal'
    if type == 'error' then nType = 'error'
    elseif type == 'success' then nType = 'success'
    end
    SendNotification(nType, text, length)
end)
