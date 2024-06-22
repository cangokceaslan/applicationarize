const readline = require('readline');
const { exec } = require('child_process');
const { resolve, join, dirname } = require('path');
const fs = require('fs');
const url = require('url');
const os = require('os');
const axios = require('axios');
const nativefier = require('nativefier').default;
const pngToIco = require('png-to-ico');

// ANSI color codes
const CYAN = '\x1b[36m';
const NC = '\x1b[0m'; // No Color
const GREEN = '\x1b[32m';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: (line) => {
        const completions = getCompletions(line);
        return [completions, line];
    }
});

function getCompletions(line) {
    if (line.trim() === '') return [[], line];

    const basePath = line.endsWith('/') ? resolve(line) : resolve(dirname(line));
    const partial = line.endsWith('/') ? '' : line.split('/').pop();

    try {
        const entries = fs.readdirSync(basePath);
        const completions = entries
            .filter(entry => entry.startsWith(partial))
            .map(entry => (line.endsWith('/') ? line : line.replace(/[^/]*$/, '')) + entry);
        return completions;
    } catch (error) {
        return [];
    }
}

function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

function isValidUrl(input) {
    try {
        new url.URL(input);
        return true;
    } catch (_) {
        return false;
    }
}

async function convertPngToIcoForWindows(path) {
    if (os.platform() !== 'win32') return path;

    const icoPath = path.replace('.png', '.ico');
    const icoBuffer = await pngToIco(path);
    fs.writeFileSync(icoPath, icoBuffer);

    return icoPath || path;
}

async function downloadIcon(iconUrl) {
    const iconPath = resolve(os.tmpdir(), 'icon.png');
    const writer = fs.createWriteStream(iconPath);

    const response = await axios({
        url: iconUrl,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            let path = convertPngToIcoForWindows(iconPath) || iconPath;
            resolve(path)
        });
        writer.on('error', reject);
    });
}



const injectPath = resolve(__dirname, './', 'preload', 'index.js');

const downloadOptions = {
    saveAs: true
}

async function main(options = {
    name: undefined,
    icon: undefined,
    url: undefined,
    platform: undefined
}) {
    const name = options.name || await prompt(`${CYAN}Name:${NC} `);
    const icon = options.icon || await prompt(`${CYAN}Icon:${NC} `);
    const appUrl = options.url || await prompt(`${CYAN}URL:${NC} `);
    const platform = options.platform || await prompt(`${CYAN}Platform (mac/windows/linux) (Optional):${NC} `);

    let platformSuffix = '';

    if (platform === 'mac') {
        platformSuffix = 'darwin';
    } else if (platform === 'windows') {
        platformSuffix = 'win32';
    } else if (platform === 'linux') {
        platformSuffix = 'linux';
    }

    let resolvedIcon;
    if (isValidUrl(icon)) {
        resolvedIcon = await downloadIcon(icon);
    } else {
        resolvedIcon = resolve(icon);
    }

    const desktopPath = join(os.homedir(), 'Desktop');

    // Dynamically import ora and open after gathering user inputs
    const ora = (await import('ora')).default;
    const open = (await import('open')).default;
    const spinner = ora('Generating application with Nativefier...').start();

    process.env.NATIVEFIER_APPS_DIR = desktopPath;

    const appOptions = {
        name: name,
        icon: resolvedIcon,
        targetUrl: appUrl,
        internalUrls: '.*',
        disableOldBuildWarning: true,
        maximize: true,
        platform: platformSuffix,
        ignoreCertificate: true,
        insecure: true,
        inject: [injectPath],
        injectPreload: [injectPath],
        out: desktopPath,
        singleInstance: true,
        fileDownloadOptions: {
            saveAs: true, // always show "Save As" dialog
        },
        quiet: true
    }

    nativefier(appOptions, async (error, appPath) => {
        spinner.stop();
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }

        await open(appPath).catch((openError) => {
            console.error(`Error opening directory: ${openError.message}`);
        });

        // Clean up the downloaded icon if necessary
        if (isValidUrl(icon)) {
            fs.unlinkSync(resolvedIcon);
        }
    });


    rl.close();
}

module.exports = main;