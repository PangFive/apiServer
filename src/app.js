import express from "express";
import axios from "axios";
import cors from "cors"
import qs from "qs";
import fernet from "fernet";
import 'dotenv/config'

const app = express();
app.use(cors());
app.options('*', cors());

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const portApp = process.env.PORT;
const urlApp = 'localhost'
const protocolApp = 'http'
const baseUrlApp = `${protocolApp}://${urlApp}:${portApp}`
const baseUrl = 'https://map.bpkp.go.id';

app.get('/get_bearer_token', async (req, res) => {

    try {

        var secret = new fernet.Secret("YXKuFIV17g0Pcv2FqDvQ4HfC-2-iWO_ZxxxvViVMo44=");

        var token = new fernet.Token({
            secret: secret,
            time: Date.parse(1),
            iv: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        })

        token.encode("rQ5Y3nNdnnrL7JUTY7ePO2uj9z4s8I2onL4eql6H5rUcVhNFvGuAIaLRFsEYVx1I")
        res.send(token.token)

    } catch (err) {

        res.json({
            status: 'error',
            message: err.message,
            data: err?.data
        });

    }

});

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
    
    if (req.headers["authorization"] != undefined) {
        config.headers['Authorization'] = req.headers["authorization"]
    }
    
    if (req.headers["x-client-id"] != undefined) {
        config.headers['x-client-id'] = req.headers["x-client-id"]
    }

    try {

        await axios.get(url,config).then((response)=>{
    
            res.statusCode = response.status;
    
            res.json(response.data);
        })

    } catch (err) {

        res.json({
            status: 'error',
            message: err.message,
            data: err?.data
        });

    }

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
    
    if (req.headers["authorization"] != undefined) {
        config.headers['Authorization'] = req.headers["authorization"]
    }
    
    if (req.headers["x-client-id"] != undefined) {
        config.headers['x-client-id'] = req.headers["x-client-id"]
    }
    
    try {
        
        await axios.post(url, req.body ,config).then((response)=>{
    
            res.statusCode = response.status;
            console.log(response)
            res.json(response.data);
        })

    } catch (err) {

        res.json({
            status: 'error',
            message: err.message,
            data: err?.data
        });

    }

});

app.listen(portApp, () => {
    console.log('jalan port ' + portApp);
})