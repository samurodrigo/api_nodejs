var express = require("express"),
    bodyParser = require("body-parser"),
    client = new require("mongodb").MongoClient(),
    uri = process.env.DB_CONNECTION_STRING,
    objectId = require("mongodb").ObjectID,
    multipart = require("connect-multiparty"),
    fs = require("fs")
var app = express()

app.use(bodyParser.urlencoded({extended:true}))

app.use(bodyParser.json())

//CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
    res.setHeader("Access-Control-Allow-Headers", "content-type")  
    res.setHeader("Access-Control-Allow-Credentials", true)
    next()
})

//Multipart form
app.use(multipart())

var PORT = 8095

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`)
})

app.get("/", (req, res) => {
    res.send({msg: "Olá"})
})

app.post("/api", (req, res) => {
    
    var urlImagem = `${new Date().getTime()}_${req.files.arquivo.originalFilename}`
    var caminhoOrigem = req.files.arquivo.path
    var caminhoDestino = `./uploads/${urlImagem}`

    fs.rename(caminhoOrigem, caminhoDestino, function(err) {
        if(err){
            res.status(500).send(err)
            return
        }

        var dados = {
            url_imagem: urlImagem,
            titulo: req.body.titulo
        }
        client.connect(uri).then(cli => {
            var db = cli.db("test")
            var collection = db.collection('postagens')
            collection.insert(dados, function(err, results){
                res.status(err ? 500 : 200).json(err || {status: "Inclusão realizada com sucesso"   })
                cli.close()
            })
        })
        .catch(err => {
            console.log(err)
        })
    })    
})

app.get("/api", (req, res) => {
    var dados = req.body
    client.connect(uri).then(cli => {
        var db = cli.db("test")
        var collection = db.collection('postagens')
        collection.find().toArray(function(err, results){
            res.status(err ? 500 : 200).json(err || results)
            cli.close()
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
            cli.close()
        })
    })
    .catch(err => {
        console.log(err)
    })
})

app.put("/api/:id", (req, res) => {
    
    client.connect(uri).then(cli => {
        var db = cli.db("test")
        var collection = db.collection('postagens')
        collection.update(
            { _id: objectId(req.params.id) },
            { 
                $push: {
                    comentarios: {
                        idComentario: new objectId(),
                        comentario: req.body.comentario
                    }
                } 
            },
            {},
            function(err, results){
                res.status(err ? 500 : 200).json(err || results)
                cli.close()
            })
    })
    .catch(err => {
        console.log(err)
    })
})

app.delete("/api/:id", (req, res) => {
    client.connect(uri).then(cli => {
        var db = cli.db("test")
        var collection = db.collection('postagens')
        collection.update(
            {  },
            { 
                $pull: {
                    comentarios: {
                        idComentario: objectId(req.params.id)
                    }
                }
            },
            { multi: true },
            function(err, results){
                res.status(err ? 500 : 200).json(err || results)
                cli.close()
            })
    })
    .catch(err => {
        console.log(err)
    })
})

app.get("/imagens/:imagem", (req, res) =>{
    fs.readFile(`./uploads/${req.params.imagem}`,function(erro, data){
        if(erro){
            res.status(400).send(erro)
        }else{
            res.writeHead(200, {
                "content-type": "image/png"
            })
            res.end(data)
        }
    })
})