const readline = require('readline');
const { exec } = require('child_process');
const { resolve, join, dirname } = require('path');
const fs = require('fs');
const url = require('url');
const os = require('os');
const axios = require('axios');

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
        writer.on('finish', () => resolve(iconPath));
        writer.on('error', reject);
    });
}

const injectPath = resolve(__dirname, '..', 'preload', 'index.js');


async function main() {
    const name = await prompt(`${CYAN}Name:${NC} `);
    const icon = await prompt(`${CYAN}Icon:${NC} `);
    const appUrl = await prompt(`${CYAN}URL:${NC} `);
    const platform = await prompt(`${CYAN}Platform (mac/windows/linux) (Optional):${NC} `);

    let platformStr = '';
    let platformSuffix = '';

    if (platform === 'mac') {
        platformStr = '--platform darwin';
        platformSuffix = '-darwin';
    } else if (platform === 'windows') {
        platformStr = '--platform windows';
        platformSuffix = '-win32';
    } else if (platform === 'linux') {
        platformStr = '--platform linux';
        platformSuffix = '-linux';
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

    // Set NATIVEFIER_APPS_DIR to Desktop
    process.env.NATIVEFIER_APPS_DIR = desktopPath;

    const command = `npx nativefier --name "${name}" --icon "${resolvedIcon}" "${appUrl}" --internal-urls ".*" --disable-old-build-warning-yesiknowitisinsecure --maximize ${platformStr} --ignore-certificate --insecure --inject ${injectPath} --inject-preload ${injectPath} --out "${desktopPath}" --single-instance`;

    exec(command, { stdio: 'inherit' }, async (error, stdout, stderr) => {
        spinner.stop();
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }

        try {
            // Find the directory starting with the app name and the platform suffix
            const files = fs.readdirSync(desktopPath);
            const appDir = files.find(file => file.startsWith(name) && file.includes(platformSuffix));

            if (!appDir) {
                throw new Error('Application directory not found');
            }

            const appPath = join(desktopPath, appDir);

            // Set permissions for the directory
            fs.chmodSync(appPath, '755');

            console.log(`${GREEN}Application ${name} created successfully on Desktop.${NC}`);
            await open(appPath).catch((openError) => {
                console.error(`Error opening directory: ${openError.message}`);
            });

            // Clean up the downloaded icon if necessary
            if (isValidUrl(icon)) {
                fs.unlinkSync(resolvedIcon);
            }
        } catch (error) {
            console.error(`Error setting permissions or opening directory: ${error.message}`);
        }
    });

    rl.close();
}

module.exports = main;