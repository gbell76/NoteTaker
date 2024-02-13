const express = require('express')
const path = require('path')
const fs = require('fs')

const PORT = 3001

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(express.static('public'))

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, './public/index.html'))
})

app.get('/notes', (request, response) => {
    response.sendFile(path.join(__dirname, './public/notes.html'))
})

app.get('/api/notes', (request, response) => {
    fs.readFile('./db/db.json', 'utf-8', (err, data) => {
        if(err){
            console.error(err)
        }else{
            const parsedNotes = JSON.parse(data)
            response.json(parsedNotes.map((e, i) => ({...e, id: i+1})))
        }
    })
})

app.post('/api/notes', (request, response) => {
    const {title, text} = request.body
    if(title && text){
        const newNote = {
            title,
            text
        }

        fs.readFile('./db/db.json', 'utf-8', (err, data) => {
            if(err){
                console.error(err)
            }else{
                const parsedNotes = JSON.parse(data)
                parsedNotes.push(newNote)
                fs.writeFile(`./db/db.json`, JSON.stringify(parsedNotes), (err) => {
                    if(err){
                        console.error(err)
                    }
                })
            }
        })

        const res = {
            status : 'success',
            body: newNote
        }
    
        response.status(201).json(res)
    }else{
        response.status(500).json('Error in saving note')
    }
})

app.delete('/api/notes/:id', (request, response) => {
    fs.readFile('./db/db.json', 'utf-8', (err, data) => {
        if(err){
            console.error(err)
        }else{
            const parsedNotes = JSON.parse(data)
            const id = request.params.id
            parsedNotes.splice(id-1, 1)
            fs.writeFile(`./db/db.json`, JSON.stringify(parsedNotes), (err) => {
                if(err){
                    console.error(err)
                }
            })
        }
    })

    const res = {
        status : 'success'
    }

    response.status(201).json(res)
})

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
)