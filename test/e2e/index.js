const {http2 , http , https} = require('../../lib/index');
const {Http2Debug} = require('http2-debug');


const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-spies'));

const httpModule = require('http');
const SERVER_HOST = '0.0.0.0';

const HTTP_PORT = 8080;
const HTTP2_PORT = 8443;

const HTTP_URL = `http://${SERVER_HOST}:${HTTP_PORT}`;
const HTTP2_URL = `https://${SERVER_HOST}:${HTTP2_PORT}`;

const serverCloseActions = [];

const onHttpServerReady = new Promise((resolve , reject)=>{
    try{
        const server = httpModule.createServer((req, res) => {
           if (req.url == '/1'){
               res.redirect('/2')
           }
           else{
               res.setHeader('step' , '2')
               res.end('2');
           }
        });
        server.listen(HTTP_PORT,SERVER_HOST, (err) => {
            if (err)
                return reject(err);

            serverCloseActions.push(server.close.bind(server));
            resolve()
        });
    }
    catch(err){
        reject(err);
    }
});
const onHTTP2ServerReady = new Promise((resolve , reject)=>{
    http2Debug = new Http2Debug;
    http2Debug.onStream = function onStream(stream , headers){
        const path = headers[':path'];
        if (path == '/1'){
            stream.respond({
                'location': '/2',
                ':status': 302
            });
            stream.end('');
        }
        else{
            stream.respond({
                'content-type': 'text/html',
                'step' : '2',
                ':status': 200
            });
            stream.end('hi');
        }
       
    }
    http2Debug.createServer((err)=>{
        if (err)
            return reject(err);
        resolve();
        serverCloseActions.push(http2Debug.stopServer.bind(http2Debug));
    });
})

describe('e2e' , ()=>{
    before(()=>{
        return Promise.all([
            onHttpServerReady,
            onHTTP2ServerReady
        ])
    });
    it('Should export the "follow redirects" original http/https' , async ()=>{
        const followRedirect = require('follow-redirects');
        expect(followRedirect.http).eq(http);
        expect(followRedirect.https).eq(https);
  })
    it('Should follow h2 redirects' , async ()=>{
          return new Promise((resolve , reject)=>{
            http2.get(`${HTTP2_URL}/1`, function (response) {
                expect(response.headers.step).eq('2');
                var buf = '';
                response.on('data' , (d)=>{
                    buf+=d;
                });
                response.on('end' ,()=>{
                    expect(buf).eq('hi');
                    resolve();
                })
                expect(response.headers.step).eq('2');
            });
          })
    })

    after(()=>{
        serverCloseActions.forEach((action)=>{
            action();
        })
    })
})
