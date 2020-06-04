### [Русский язык](https://github.com/hitman249/wine-launcher/blob/master/README.RU.md)  

## What kind of project is this?

**Wine Launcher** is a Wine-based container for Windows applications.

[Video instruction](https://www.youtube.com/watch?v=GRlebaAVWn8)  

<details>
<summary><b>Main ideas:</b></summary>
<br>

- System isolation
- System independence
- For each application there is a separate set of Wine and Prefix

<br>
</details>

<details>
<summary><b>Capabilities:</b></summary>
<br>

- Separate **Wine\Prefix**
- Compress **Wine\Data** in **squash** images to save space
- **Wine** Update
- Integration with **DXVK**, **MangoHud**, **VkBasalt**
- Support for multiple applications in one port
- Patch generation
- Diagnostics

<br>
</details>

## Installation

1. Download the current `start` (x86_64 only) file from the [releases](https://github.com/hitman249/wine-launcher/releases) page.
2. Create an empty directory anywhere and move the file there.
3. Make the file executable and run
   ```bash
   chmod +x ./start && ./start
   ```
4. Wait for initialization.
5. Close the launcher and move the `start` file to the `bin` folder that appears.
6. Done.

> In one Wine Launcher, it is recommended to install only one game. 
Then it will be more convenient for you to compress it to save
> places in the section `Tools > Packaging`

<details>
<summary><b>How to install the game?</b></summary>
<br>

1. Before installing the game, you need to create a new patch.
2. Give the patch a meaningful name as this word will be called the folder in which the patch is stored.
3. After installing the game, do not forget to save the patch. This will come in handy for you to upgrade **Wine** in the future to recreate the prefix.
4. If you need to install something else, repeat steps 1-3.

> The game must **be sure** installed in the `C:\Games` folder! If another folder is required, it must be reassigned to
> prefix settings, and then recreate it.

<br>
</details>


#### Games

Implemented a simple launch of games, but extended with additional features, such as advanced logging and display of the FPS counter.

![Main](main.gif)


<details>
<summary><b>Wine Update</b></summary>
<br>

Convenient GUI for updating Wine includes 6 repositories.

![Main](wine.gif)

<br>
</details>

<details>
<summary><b>Configuring Prefix</b></summary>
<br>

* In prefix settings there is an automatic installation of DXVK, MangoHud, VkBasalt.
* Restore the resolution of the active monitor after exiting the game.

![Main](prefix.gif)

<br>
</details>

<details>
<summary><b>Game Settings</b></summary>
<br>

* All games must be installed in the default folder, which is set in the prefix default settings for `Games`.
* In the games themselves, you can specify the design of the **icon** and **background**.
* In the game settings, the path is relative to the 'Games' folder. Be careful! 
  Example, if the path to the executable file is `C:/Games/The super game/bin/game.exe`, then you need to write in the game settings
    - In the **Path to folder** field: `The super game/bin`
    - In the **File name** box: `game.exe`

![Main](games.gif)

<br>
</details>

<details>
<summary><b>Patches</b></summary>
<br>

* Everything that is in **prefix** is issued in the form of **patches**.
* If you use third-party patches, you must recreate **prefix** to apply them.
* In other words, **prefix** is not a long-lived structure, you need to recreate it every time you change the **Wine** version or to apply third-party patches.

![Main](patches.gif)

<br>
</details>

<details>
<summary><b>Create a new patch</b></summary>
<br>

When creating a patch, you have the following options:
Before you start, be sure to read the **Game Settings**^

  * Installing the application (game)
  * Installing an application (game) from a disk image
  * Register `dll`, `ocx` libraries
  * **Winetricks**, available out of the box
  * Wine config
  * Wine File Manager
  * Wine Regedit

![Main](patch.gif)

<br>
</details>
