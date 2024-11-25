const {createLogger, format, transports} = require('winston');
const {combine, json, colorize} = format;

// define a custom format for console logging
const consoleLogFormat = format.combine(
    format.colorize(),
    format.printf(({ level, message}) =>{
        return `${level}: ${message}`;
    })
);

// create a new logger instance
const logger = createLogger({
    level: 'info',
    // Set the format for the logs: colorize and output as JSON
    format: combine( colorize(), json()),
    transports: [
        // Log to the console with the defined custom format 
        new transports.Console({format: consoleLogFormat}) 
    ]
});

module.exports = logger;
