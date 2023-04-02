const express = require('express')
const app = express()
const port = 3000
const path = require('path')

app.use(express.static(path.join(__dirname, '..', 'build')))
app.use(express.static('public'))

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

app.listen(port, () => {
    console.log('server started on port 3000')
})