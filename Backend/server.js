require('dotenv').config()
const app = require('./src/app')




app.listen(3002,()=>{
    console.log('server is running on port 3002')
})
