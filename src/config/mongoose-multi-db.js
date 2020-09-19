const mongoose = require('mongoose')

const getConfigValidated = (config) => {

    if (!config) throw 'config can not be empty'
    if (!config.connections || !config.connections.length) throw 'config.connections can not be empty'
    
    if (!config.helthcheck || !config.helthcheck.interval) {
        config.helthcheck = { interval: 60000}
    }

    return config
}

const model = (collection, schema, config) => {
    
    const conf = getConfigValidated(config)

    const models = conf.connections
        .map(uri => uri.trim())
        .map(uri => mongoose.createConnection(uri, conf.options))    
        .map(conn => conn.model(collection, schema))
    
    let selectedModel = {size: 0, model: models[0]}
    
    const getSmallDB = (a,b) => a.size <= b.size ? -1 : 1

    const promiseStatus = (model) => (res) => model.collection.stats((err, r) => {
        try { res({model, size: r.size, ns: r.ns }) } catch (error) { res(selectedModel) }
    })

    const selectSmallDB = async () => {
        selectedModel = [...await Promise.all(models.map(model => new Promise(promiseStatus(model))))].sort(getSmallDB)[0]
        if (config.log) console.info(`[mongoose-multi-db] Main database switched [${selectedModel.ns}]`)
    }
    
    const filter = (list) => {
        const listFilter = (list || []).filter(v => v)
        return listFilter.length ? listFilter[0] : null
    }
    
    const join = (list) => Array.prototype.concat.apply([], list)
    
    const get = (data) => selectedModel.model(data)
    

    const raw = (callback) => Promise.all(models.map(callback))

    const one = (callback) => raw(callback).then(filter)
    
    const many = (callback) => raw(callback).then(join)



    const create = (data) => selectedModel.model.create(data)
    
    const insertMany = (data) => selectedModel.model.insertMany(data)

    const findById = (_id) => one(Model => Model.findById(_id))
    const findByIdLean = (_id) => one(Model => Model.findById(_id).lean())

    const findOne = (_doc) => one(Model => Model.findOne(_doc))
    const findOneLean = (_doc) => one(Model => Model.findOne(_doc).lean())

    const deleteOne = (_doc) => raw(Model => Model.deleteOne(_doc))

    const deleteMany = (_doc) => raw(Model => Model.deleteMany(_doc))

    const findByIdAndUpdate = (_id, _doc) => one(Person => Person.findByIdAndUpdate(_id, _doc))

    const findAll = () => many(Model => Model.find())
    const find = (_doc) => many(Model => Model.find(_doc))

    const findAllLean = () => many(Model => Model.find().lean())
    const findLean = (_doc) => many(Model => Model.find(_doc).lean())




    setInterval(selectSmallDB, conf.helthcheck.interval)

    return {        
        get,
        one,
        many,
        raw,
        
        create,
        insertMany,
        findById,
        findByIdLean,
        findOne,
        findOneLean,
        deleteOne,
        deleteMany,
        findByIdAndUpdate,
        findAll,
        find,
        findAllLean,
        findLean
    }
}

module.exports = {
    ...mongoose,
    model
}
