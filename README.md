## What kind of project is this?

**Wine Launcher** is a Wine-based container for Windows applications.

![Main](preview.gif)

[Video instruction](https://www.youtube.com/watch?v=GRlebaAVWn8)  

<details>
<summary><b>Main ideas:</b></summary>
<br>

- System isolation
- System independence (Only Linux systems)
- For each application there is a separate set of Wine and Prefix

<br>
</details>

<details>
<summary><b>Capabilities:</b></summary>
<br>

- Separate **Wine\Prefix**
- Compress **Wine\Data** in **squash** images to save space
- **Wine** Update
- Integration with **DXVK**, **MangoHud**, **VkBasalt**, **VKD3D Proton**
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


## Debugging

1. You can run application in the debug mode
    > In this mode the dev tools will be available

   ```bash
   env debug=1 ./start
   ``` 

2. Building the project

   ```bash 
   sudo apt-get install libxtst-dev libpng++-dev
   sudo npm install -g node-gyp
   npm i && cd ./src && npm i && cd ../
   npm run electron-rebuild
   npm run build
   ```  
   > When build finishes, `dist` directory will have executable file `start`

3. Development

   > Step 1. Launch Vue

   ```bash
   npm run serve
   ```  

   > Step 2. Run application in debug mode

   ```bash
   env debug=1 ./start
   ```

   > Step 3. In the opened dev tools bar, go to

   ```js
   app.href('http://localhost:8080')
   ```
