/**
 * Created by gshanka on 8/19/15.
 */
let http = require('http')
let request = require('request')
let argv = require('yargs')
    .default('host', '127.0.0.1')
    .argv
let scheme = 'http://'
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)

let path = require('path')
let fs = require('fs')
let logPath = argv.log && path.join(__dirname,argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

let destinationUrl =  argv.url || scheme + argv.host +':'+ port




http.createServer((req,res)=>{
    console.log(`Request received at: ${req.url}`)
    for(let header in req.headers){
        res.setHeader(header,req.headers[header])
    }
    req.pipe(res)
}).listen(8000)


http.createServer((req,res)=>{

    if(req.headers['x-destination-url']){
        destinationUrl = req.headers['x-destination-url']
    }

    logStream.write('\n\n\n' + JSON.stringify(req.headers))


    let options = {
        url : `${destinationUrl}${req.url}`,
        method: req.method,
        headers: req.headers
    }


    // Log the proxy request headers and content in the **server callback**
    let downstreamResponse = req.pipe(request(options))
    process.stdout.write(JSON.stringify(downstreamResponse.headers))
    downstreamResponse.pipe(logStream, {end: false})
    downstreamResponse.pipe(res)

}).listen(8001)