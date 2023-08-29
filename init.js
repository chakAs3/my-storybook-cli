#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Unicode icons for better display
const CHECKMARK = '\u2714'; // ✔
const CROSSMARK = '\u274C'; // ❌



function initStorybook() {
    console.log('Initializing Storybook configuration...');
    console.log()
        // Path to the project root
    const projectRoot = process.cwd();

    // Path to the .storybook directory
    const storybookDir = path.join(projectRoot, '.storybook');

    // Determine if the project is using TypeScript
    const isTypeScriptProject = fs.existsSync(path.join(projectRoot, 'tsconfig.json'));

    // Determine if the project has a ./src directory
    const hasSrcDirectory = fs.existsSync(path.join(projectRoot, 'src'));
    const sourceFolder = hasSrcDirectory ? 'src' : '.';

    // Choose the appropriate file extension for the configuration files
    const configFileExtension = isTypeScriptProject ? 'ts' : 'js';

    // Build the paths for stories based on the source folder
    const storiesPath = path.join(sourceFolder, '../stories');
    const storiesGlob = `${storiesPath}/**/*.stories.@(js|jsx|mjs|ts|tsx)`;

    // Load the main and preview template files
    const mainTemplatePath = path.join(__dirname, '.config', `main-${configFileExtension}`);
    const previewTemplatePath = path.join(__dirname, '.config', `preview-${configFileExtension}`);

    const mainTemplate = fs.readFileSync(mainTemplatePath, 'utf8');
    const previewTemplate = fs.readFileSync(previewTemplatePath, 'utf8');

    // Replace placeholders in the templates with dynamic values
    const mainConfigContent = mainTemplate
        .replace(/\$storiesPath/g, storiesPath)
        .replace(/\$storiesGlob/g, storiesGlob);

    const previewConfigContent = previewTemplate;

    // Create the .storybook directory if it doesn't exist
    if (!fs.existsSync(storybookDir)) {
        fs.mkdirSync(storybookDir);
    }

    // Create the Storybook main config file
    fs.writeFileSync(path.join(storybookDir, `main.${configFileExtension}`), mainConfigContent);

    // Create the Storybook preview config file
    fs.writeFileSync(path.join(storybookDir, `preview.${configFileExtension}`), previewConfigContent);

    console.log('Install dependencies 📦️')

    const packageManager = detectPackageManager();
    // Install required packages using pnpm
    const installProcess = spawn(packageManager, ['add',
        'storybook@next',
        '@storybook-vue/nuxt',
        '@storybook/vue3@next',
        "@storybook/addon-essentials@next",
        "@storybook/addon-interactions@next",
        "@storybook/addon-links@next",
        "@storybook/blocks@next",
        "-D"
    ], {
        cwd: projectRoot,
        stdio: 'inherit',
    });

    installProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`${CROSSMARK} Package installation failed with code ${code}`);
        } else {
            console.log(`${CHECKMARK} Packages installed successfully!`);
            console.log()
            console.log('✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨')
            console.log('✨✨       🚀️ You can run storybook using           ✨✨')
            console.log('✨                                                    ✨')
            console.log(`✨            ${packageManager} storybook dev                      ✨`)
            console.log(`✨                                                    ✨`)
            console.log('✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨')
            console.log()
        }
    });


}

// Function to detect the package manager
function detectPackageManager() {
    if (fs.existsSync(path.join(process.cwd(), 'package-lock.json'))) {
        return 'npm';
    } else if (fs.existsSync(path.join(process.cwd(), 'yarn.lock'))) {
        return 'yarn';
    } else if (fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'))) {
        return 'pnpm';
    }
    return 'pnpm'
}

module.exports = { initStorybook };