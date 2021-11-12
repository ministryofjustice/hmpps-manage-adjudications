import Logger from 'bunyan'

export default new Logger({
  name: 'hmpps-manage-adjudications',
  streams: [
    {
      stream: process.stdout,
      level: (process.env.LOG_LEVEL as Logger.LogLevel) || 'info',
    },
  ],
})
