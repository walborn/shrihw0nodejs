const { PORT } = require('./config')

require('./server')
  .listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`))
