const mongoose = require('mongoose')

const handleConnection = (name, connection) => {
    connection.on("error", () => {
        console.error(`[${name}] Erro ao conextar no banco de dados...`)
    })
    connection.once("open", () => {
        console.info(`[${name}] Banco de dados conectado com sucesso...`)
    })
}

const connect = (name, uri) => {
    console.info(`[${name}] Iniciando banco de dados...`)

    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })

    return mongoose.connection
}


const databaseInit = async () => {

    const conn = connect('Default', process.env.MONGO_DB_CONNECTION)
    handleConnection('Default', conn)

}

module.exports = {
    databaseInit
}
