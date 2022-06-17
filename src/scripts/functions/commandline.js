//! USE THIS FUNCTION ONLY FOR EXECUTING CUSTOM COMMANDS FROM THE CONSOLE
function cmd(cmd) {
    exec(
        cmd,
        { cwd: `${config.cadDir}` },
        (error, stdout, stderr) => {
            if (error) {
                log.add(error);
            }
            if (stdout) {
                log.add(stdout);
            }
            if (stderr) {
                log.add(stderr);
            }
        }
    );
}
//? Use this function for executing pre-defined commands inside the manager-app code.
function command(cmd) {
    addToOutputStream('Executing Command - Please Wait...', 'f');
    exec(cmd, { cwd: `${config.cadDir}` }, (error, stdout, stderr) => {
        if (error) {
            addToOutputStream(error, 'c');
            addToOutputStream('Command Complete', 'f');
        }
        if (stdout) {
            addToOutputStream(stdout, 'a');
            addToOutputStream('Command Complete', 'f');
        }
        if (stderr) {
            addToOutputStream(stderr, 'b');
            addToOutputStream('Command Complete', 'f');
        }
    });
}
function addToOutputStream(output, type) {
    if (type == 'a') {
        elements.main.cmdoutput.prepend(`<span>${output}</span>`);
        log.add(`${output}`, 0)
    } else if (type == 'g') {
        elements.main.cmdoutput.prepend(
            `<span style="color: lime; font-weight: bold;">${output}</span>`
        );
        log.add(`${output}`, 4)
    } else if (type == 'b') {
        elements.main.cmdoutput.prepend(
            `<span style="color: orange">${output}</span>`
        );
        log.add(`${output}`, 1)
    } else if (type == 'c') {
        elements.main.cmdoutput.prepend(
            `<span style="color: red;">${output}</span>`
        );
        log.add(`${output}`, 2)
    } else if (type == 'f') {
        elements.main.cmdoutput.prepend(
            `<span style="color: cyan;">----- ${output} -----</span>`
        );
        log.add(`${output}`, 3)
    } else {
        elements.main.cmdoutput.prepend(
            `<span style="color: red; font-weight: bold;">CRITICAL UNCAUGHT ERROR</span>`
        );
    }
}
function spw(cmd, args) {
    addToOutputStream('Executing Command - Please Wait...', 'f');

    if (cmd.indexOf('kill-port') >= 0) {
        log.add('Killing Ports');
    }

    let command = spawn(cmd, args, { cwd: `${config.cadDir}`, shell: true });

    command.stdout.on('data', (stdout) => {
        if (stdout.toString().indexOf('exited with code 1') >= 0 || stdout.toString().indexOf('port 8080 killed') >= 0) {
            addToOutputStream('<b>CAD Connection Closed</b>', 'b');
            setStatus.cad(false);
        } else if (stdout.toString().indexOf('exited with code 0') >= 0) {
            addToOutputStream(
                '<b>CAD Error<br>Check Logs for Error Output</b>',
                'c'
            );
            setStatus.cad(false);
        }
        if (stdout.toString().indexOf('running with version') >= 0) {
            addToOutputStream('CAD Connection Started Successfully', 'g');
            setStatus.cad(true);
        }
        addToOutputStream(stdout.toString(), 'a');
        log.add(stdout.toString());
    });

    command.stderr.on('data', (stderr) => {
        addToOutputStream(stderr.toString(), 'b');
        log.add(stderr.toString());
    });
}
