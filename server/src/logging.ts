import _ from 'lodash';
import { Logger as winsLogger, createLogger, transports, format} from 'winston';
import { Format } from 'logform';

const toScreen = format.printf(({ level, message, timestamp, stack }) => {
  return _.isObject(message)
    ? `[${timestamp}] ${level}: ${JSON.stringify(message)}`
    : `[${timestamp}] ${level}: ${stack || message}`;
});

const myFormat = format.printf(({ level, message, timestamp }) => {
  return _.isObject(message)
    ? `{"timestamp":"${timestamp}"},{"level":"${level}"},${JSON.stringify(message)}`
    : `{"timestamp":"${timestamp}"},{"level":"${level}"},{"message":"${message}"}`;
});

class Log {
  private static instance: winsLogger;

  static getInstance(): winsLogger {
    if (!Log.instance) {
      Log.instance = createLogger({
        level:'debug',
        exitOnError: false,
        format: format.combine(format.errors({ stack: true }), format.timestamp(), format.colorize(), format.splat(), format.json(), toScreen),
        transports: [
          new transports.Console({
            // level:'debug',
            // format: format.combine((format.json(), format.splat(), format.errors({ stack: true }), format.colorize(), format.timestamp(), toScreen))
          }),
          // new transports.File({ filename: 'logs/error.log', level: 'error' }),
          // new transports.File({ filename: 'logs/audit-report.log', level: 'info' }),
          // new transports.File({ filename: 'logs/audit-debug.log', level: 'debug' }),
          // _.map(Config.logging, logEntry => {
            //   //   // return new DailyRotateFile(_.pick(logEntry,['filename','level']));
            //   //   return new DailyRotateFile(logEntry);
            //   // })
        ]
      });

      // // TODO: keep when needing to write to log and console
      // Log.instance.add(
      //   new transports.Console({
      //     level: 'debug',
      //     format: format.combine(format.colorize(), format.timestamp(), format.splat(), format.errors({stack:true})), // toScreen
      //   }),
      // );
    }

    return Log.instance;
  }
}

export const Logger = Log.getInstance();
export function convertError(error:any): string {
  if (!(error instanceof Error)) {
    return error;
  }

  return _.get(error,'stack') || error.toString();
}

let retVal = Log.getInstance();
