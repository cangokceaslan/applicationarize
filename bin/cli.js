#!/usr/bin/env node

const { program } = require('commander');
const main = require('../index');
const package = require('../package.json');

program
    .version(package.version)
    .description(package.description)
    .option('-n, --name <name>', 'Name of the app')
    .option('-i, --icon <path>', 'Icon path or URL')
    .option('-u, --url <url>', 'URL')
    .option('-p, --platform <platform>', 'Platform (mac/windows/linux)')
    .action((options) => {
        main(options);
    });

program.parse(process.argv);