var express = require("express"),
    bodyParser = require("body-parser"),
    client = new require("mongodb").MongoClient(),
    uri = process.env.DB_CONNECTION_STRING,
    objectId = require("mongodb").ObjectID
var app = express()

app.use(bodyParser.urlencoded({extended:true}))

app.use(bodyParser.json())

var PORT = 8095

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`)
})

app.get("/", (req, res) => {
    res.send({msg: "Olá"})
})

app.post("/api", (req, res) => {
    var dados = req.body
    client.connect(uri).then(cli => {
        var db = cli.db("test")
        var collection = db.collection('postagens')
        collection.insert(dados, function(err, results){
            res.status(err ? 500 : 200).json(err || results)
        })
    })
    .catch(err => {
        console.log(err)
    })
})

app.get("/api", (req, res) => {
    var dados = req.body
    client.connect(uri).then(cli => {
        var db = cli.db("test")
        var collection = db.collection('postagens')
        collection.find().toArray(function(err, results){
            res.status(err ? 500 : 200).json(err || results)
        })
    })
    .catch(err => {
        console.log(err)
    })
})
app.get("/api/:id", (req, res) => {
    var dados = req.body
    client.connect(uri).then(cli => {
        var db = cli.db("test")
        var collection = db.collection('postagens')
        collection.find(objectId(req.params.id)).toArray(function(err, results){
            res.status(err ? 500 : 200).json(err || results)
        })
    })
    .catch(err => {
        console.log(err)
    })
})

app.put("/api/:id", (req, res) => {
    var dados = req.body
    client.connect(uri).then(cli => {
        var db = cli.db("test")
        var collection = db.collection('postagens')
        collection.update(
            { _id: objectId(req.params.id) },
            { $set: dados },
            {},
            function(err, results){
                res.status(err ? 500 : 200).json(err || results)
            })
    })
    .catch(err => {
        console.log(err)
    })
})

app.delete("/api/:id", (req, res) => {
    var dados = req.body
    client.connect(uri).then(cli => {
        var db = cli.db("test")
        var collection = db.collection('postagens')
        collection.remove(
            { _id: objectId(req.params.id) },
            function(err, results){
                res.status(err ? 500 : 200).json(err || results)
            })
    })
    .catch(err => {
        console.log(err)
    })
})