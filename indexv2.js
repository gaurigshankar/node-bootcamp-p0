/**
 * Created by gshanka on 8/19/15.
 */
/**
 * Created by gshanka on 8/19/15.
 */
let http = require('http')
let request = require('request')
let argv = require('yargs')
    .usage('Usage: node ./index.js [options]')
    .epilog('copyright walmartlabs/codepath 2015')
    .default('host', '127.0.0.1')
    .describe('p','Specify a forwarding port')
    .alias('p' , 'port')
    .describe('x','Specify a forwarding host')
    .alias('x' , 'host')
    .describe('e','Specify a a process to proxy instead')
    .alias('e' , 'excec')
    .describe('l','Specify a output log file')
    .alias('l' , 'log')
    .help('h')
    .alias('h', 'help')
    .argv
let scheme = 'http://'
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)

let path = require('path')
let fs = require('fs')
let logPath = argv.log && path.join(__dirname,argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

let destinationUrl =  argv.url || scheme + argv.host +':'+ port
argv

console.log("argv.log "+argv.log)
console.log("logpath "+logPath)

http.createServer((req,res)=>{
    for(let header in req.headers){
        res.setHeader(header,req.headers[header])
    }
    req.pipe(res)
}).listen(8000)


http.createServer((req,res)=>{

    logStream.write('\n\n\n' + JSON.stringify(req.headers))
    req.pipe(logStream, {end: false})

    let options = {
        url : `${destinationUrl}${req.url}`,
        method: req.method,
        headers: req.headers
    }
    if(req.headers['x-destination-url']){
        options.url = req.headers['x-destination-url']
    }

    // Log the proxy request headers and content in the **server callback**
    let downstreamResponse = req.pipe(request(options))
    process.stdout.write(JSON.stringify(downstreamResponse.headers))
    downstreamResponse.pipe(logStream, {end: false})
    downstreamResponse.pipe(res)

}).listen(8001)