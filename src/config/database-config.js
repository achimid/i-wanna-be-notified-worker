module.exports = {
    connections: process.env.MONGO_DB_CONNECTIONS.split(','),
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    },
    strategy: 'size',
    helthcheck: { interval: 60000 * 5 },
    log: true
}