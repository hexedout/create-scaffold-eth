#!/usr/bin/env node
const pkg = require('./package.json');
const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { templates } = require('./templates');
const { spawn } = require('child_process');

const challengeNames = templates
    .filter((template) => template.type === 'challenge')
    .map((template) => `${template.emoji} ${template.name}`);

const projectNames = templates
    .filter((template) => template.type === 'project')
    .map((template) => `${template.emoji} ${template.name}`)

async function main() {
    console.log(`
    ${chalk.bold.magenta('Welcome to 🏗  create-scaffold-eth')}
    `);

    program
    .version(pkg.version)
    .option('--https', 'use https instead of ssh')
    .action((options) => {
        const { https } = options;

        inquirer.prompt([
            {
                type: 'list',
                name: 'template',
                message: 'Pick your template',
                loop: false,
                choices: [
                    new inquirer.Separator('---- Projects ----'),
                    ...projectNames,
                    new inquirer.Separator('---- Challenges ----'),
                    ...challengeNames,
                    new inquirer.Separator('---- End ----'),
                ]
            },
            {
                type: 'input',
                name: 'directory',
                message: 'Directory name',
                default: (answers) => answers.template
            },
        ])
        .then((answers) => {
            const { template, directory } = answers;

            console.log(chalk.greenBright(`${pkg.name}: building '${template}' into '${directory}'...`));

            const { httpUrl, sshUrl, branch } = templates.find((t) => `${t.emoji} ${t.name}` === template);

            const args = [];
            args.push(https ? httpUrl : sshUrl);
            if (branch) {
                args.push(branch);
            };
            args.push(directory);

            spawn('git', ['clone', ...args], { stdio: 'inherit' });
        })
        .catch((e) => {
            console.error(e);
            process.exit(1);
        });
    })

    program.parse(process.argv);
}

main();
