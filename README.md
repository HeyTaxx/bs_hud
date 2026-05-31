# BS HUD - Modern HUD System

**BS HUD** is a modern, highly customizable HUD for FiveM, supporting both ESX Legacy and QBCore frameworks. It brings a sleek and immersive interface with dynamic status indicators, an integrated speedometer, and a stress system.

## Features

- **Framework Compatibility:** Works seamlessly with ESX and QBCore.
- **Dynamic Status Indicators:** Displays Health, Armor, Hunger, Thirst, Stress, Oxygen, and Nitro.
- **Advanced Stress System:** Stress increases dynamically (e.g., shooting, being shot, speeding, crashing) and can be relieved by eating, drinking, or walking.
- **Speedometer & Vehicle Info:** 
  - Integrated Seatbelt system (Toggle key configurable).
  - Displays KM/H or MPH, Gear, and Fuel.
- **Minimap Customization:** Choose between circle or square map shapes. Option to display minimap even on foot.
- **Immersive HUD Logic:** Automatically hides the HUD when aiming, when dead, or when the pause menu is active.
- **Weapon & ID Info:** Built-in weapon HUD and player ID display.
- **Fully Localized:** Customizable language strings in config.

## Installation

1. Download the resource and place the `bs_hud` folder into your server's `resources` directory (e.g., in `[systems]`).
2. Open your `server.cfg` and add `ensure bs_hud`.
3. Configure the script to your liking via `config.lua`.

## Configuration

The `config.lua` file contains numerous settings including:
- Framework selection (`Config.Framework`).
- Stress multipliers and relief values.
- Speedometer units (`KMH` or `MPH`).
- Keybinds (e.g., Seatbelt).
- Map shape and localization strings.

## License

This resource is provided **free to use on FiveM servers**. 
However, **DO NOT share or re-upload** this resource anywhere without explicit permission. Please read the `LICENSE` file for more details.
