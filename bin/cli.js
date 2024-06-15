#!/usr/bin/env node

const { program } = require('commander');
const main = require('../index');

program
    .version('1.0.0')
    .description('This is a simple CLI application that helps you to create a electron application with a single command.')
    .option('-n, --name <name>', 'Name of the app')
    .option('-i, --icon <path>', 'Icon path or URL')
    .option('-u, --url <url>', 'URL')
    .option('-p, --platform <platform>', 'Platform (mac/windows/linux)')
    .action((options) => {
        main(options);
    });

program.parse(process.argv);