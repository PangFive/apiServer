import Fastify from 'fastify';
import axios from "axios";
import qs from "qs";
import fernet from "fernet";
import 'dotenv/config';
import cors from '@fastify/cors';
import {promises as fs} from 'fs';

const fastify = Fastify({
    logger: false
})

await fastify.register(cors, { 
    origin: '*'
})


const portApp = process.env.PORT;
const urlApp = 'localhost'
const protocolApp = 'http'
const baseUrlApp = `${protocolApp}://${urlApp}:${portApp}`
const baseUrl = 'https://map.bpkp.go.id';

// root
fastify.get('/', function (req, res) {
    console.log(req.headers)
    res.send({ hello: 'world' })
})

fastify.post('/', function (req, res) {
    console.log(portApp)
    res.send({ hello: 'world' })
})

fastify.get('/talenta/:api_token', async function (req, res) {
    
    const api_token = req.params.api_token;


    let url_get_pegawai = "https://map.bpkp.go.id/api/v2/pegawaiSingkat?api_token=" + api_token;

    let config = {
        headers : {
            'Host' : 'map.bpkp.go.id',
            'User-Agent' : 'okhttp/3.14.9',
        }
    }

    let data_pegawai 

    await fs.readFile("./src/pegawaiSingkat.json", "utf8", (err, jsonString) => {
        if (err) {
          console.log("Error reading file from disk:", err);
          return;
        }
        try {
            return jsonString;
        } catch (err) {
          console.log("Error parsing JSON string:", err);
        }
    }).then(data => (data_pegawai = JSON.parse(data)))

 
    // await axios.get(url_get_pegawai,config).then((response)=>{
    
    //     // res.statusCode = response.status;
    //     data_pegawai = response.data;
    // })

    let result = [];

    for (let [index, pegawai] of data_pegawai.result.entries()){

        let url_talenta = "https://map.bpkp.go.id/api/v1/talent/profile/" + pegawai.niplama + "?api_token=" + api_token;
        try {
            await axios.get(url_talenta, config).then((response) => {
    
                if (response.status == 200) {
                    result.push(response.data.result);
                };
                console.log(`berhasil ${index}`)
            });

        } catch (err) {
            console.log(`gagal ${index} - ${pegawai.nama}`)
        }

    }

    await fs.writeFile(`./src/data/dataTalenta_${Date.now()}.json`, JSON.stringify(result), 'utf8', ()=>console.log('Berhasil menyimpan data'));

    res.send( result )

})

fastify.get('/pegawai/:api_token', async function (req, res) {
    
    const api_token = req.params.api_token;


    let url_get_pegawai = "https://map.bpkp.go.id/api/v2/pegawaiSingkat?api_token=" + api_token;

    let config = {
        headers : {
            'Host' : 'map.bpkp.go.id',
            'User-Agent' : 'okhttp/3.14.9',
        }
    }

    let data_pegawai 

    try {
        await axios.get(url_get_pegawai, config).then((response) => {

            if (response.status == 200) {
                data_pegawai = response.data;
            };
        });

        await fs.writeFile(`./src/data/dataPegawai_${Date.now()}.json`, JSON.stringify(data_pegawai), 'utf8', ()=>console.log('berhasil'));

    } catch (err) {
        console.log(err)
    }

    res.send({ ...data_pegawai })

})

fastify.get('/talentaResult', async function (req, res) {

    let result 
    const searchTerm = `${req.query.kantor}`;
    const searchNama = `${req.query.nama}`;

    await fs.readFile("./src/dataTalenta.json", "utf8", (err, jsonString) => {
        if (err) {
          console.log("Error reading file from disk:", err);
          return;
        }
        try {
            return jsonString;
        } catch (err) {
          console.log("Error parsing JSON string:", err);
        }
    }).then(data => (result = JSON.parse(data)))
    
    if (searchTerm !== "undefined" && searchTerm.length > 0) {
        result = result.filter(item => {
           
           var lineStr = `${item.nama_unit}`;
           if(lineStr.toLowerCase().indexOf(searchTerm.toLowerCase()) == -1){
               return false
           }else{
               return true
           }
        })
    }

    if (searchNama !== "undefined" && searchNama.length > 0) {
        result = result.filter(item => {
           
           var lineStr = `${item.nama}`;
           if(lineStr.toLowerCase().indexOf(searchNama.toLowerCase()) == -1){
               return false
           }else{
               return true
           }
        })
    }

    res.send( result )

})

// get api
fastify.get('/api/:dataPath', async function (req, res) {

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
            let data = response.data;
            res.send({...data});
        })

    } catch (err) {
        res.statusCode = err.response.status;
        res.send({
            status: 'error',
            message: err.message,
            data: err?.data
        });

    }
})

fastify.post('/api/:dataPath', async (req, res) => {

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
            let data = response.data;
            res.send({...data});
        })

    } catch (err) {
        res.statusCode = err.response.status;
        res.send({
            status: 'error',
            message: err.message,
            data: err?.data
        });

    }

});

// Get Bearer Token
fastify.get('/get_bearer_token', function (req, res) {
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

        res.send({
            status: 'error',
            message: err.message,
            data: err?.data
        });

    }
})

// Run the server!
fastify.listen({ port: portApp }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})