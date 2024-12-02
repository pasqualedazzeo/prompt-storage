type LogLevel = 'info' | 'warn' | 'error'

class Logger {
  private log(level: LogLevel, message: string, data?: unknown) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    if (data instanceof Error) {
      console[level](`${prefix} ${message}:`, {
        message: data.message,
        name: data.name,
        stack: data.stack,
      })
    } else if (data !== undefined) {
      console[level](`${prefix} ${message}:`, data)
    } else {
      console[level](`${prefix} ${message}`)
    }
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data)
  }

  error(message: string, error?: unknown) {
    this.log('error', message, error)
  }
}

export const logger = new Logger()