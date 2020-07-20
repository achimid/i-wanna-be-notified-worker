const mongoose = require("mongoose")

module.exports = async () => {
    console.info('Iniciando banco de dados...')

    mongoose.connect(process.env.MONGO_DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    
    const db = mongoose.connection
    
    db.on("error", () => {
        console.error("Erro ao conextar no banco de dados...")
    })
    db.once("open", () => {
        console.info("Banco de dados conectado com sucesso...")
    })
}
