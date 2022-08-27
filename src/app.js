import express from "express";
import axios from "axios";
import cors from "cors"
import qs from "qs";
import bodyParser from "body-parser"

const app = express();
app.use(cors());
app.options('*', cors());

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const portApp = 3000;
const urlApp = 'localhost'
const protocolApp = 'http'
const baseUrlApp = `${protocolApp}://${urlApp}:${portApp}`
const baseUrl = 'https://map.bpkp.go.id';


app.get('/api/:dataPath', async (req, res) => {

    let path = '/'+ req.params.dataPath;
    let params = '?' + qs.stringify(req.query);
    let url = baseUrl + path + params;

    axios.baseUrl = baseUrl;

    let config = {
        headers : {
            'Host' : 'map.bpkp.go.id',
            'User-Agent' : 'okhttp/3.14.9',
        }
    }

    if (req.headers["content-type"] != undefined) {
        config.headers['Content-Type'] = req.headers["content-type"]
    }
    
    axios.get(url,config).then((response)=>{

        res.statusCode = response.status;

        res.json(response.data);
    })

});

app.post('/api/:dataPath', async (req, res) => {

    let path = '/'+ req.params.dataPath;
    let params = '?' + qs.stringify(req.query);
    let url = baseUrl + path + params;

    axios.baseUrl = baseUrl;

    let config = {
        headers : {
            'Host' : 'map.bpkp.go.id',
            'User-Agent' : 'okhttp/3.14.9',
        }
    }

    if (req.headers["content-type"] != undefined) {
        config.headers['Accept'] = req.headers["content-type"]
        config.headers['Content-Type'] = req.headers["content-type"]
    }
    
    axios.post(url,req.body ,config).then((response)=>{

        res.statusCode = response.status;

        res.json(response.data);
    })

});

app.listen(portApp, () => {
    console.log('jalan port ' + portApp);
})