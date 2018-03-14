const router = require('koa-router')();
const httpProxy = require('http-proxy');
const config = require('config');
const url = require('url')

const proxy = httpProxy.createProxyServer();
const proxyParams = config.proxyParams
router.get(`/:name(${proxyParams.name})/**`,(ctx, next) => {
    const target = proxyParams.target;
    if(!target){
        return next()
    }

    const headers = {}
    headers.Host = url.parse(target).host;
    headers.Referer = proxyParams.Referer;

    ctx.respond = false;
    proxy.web(ctx.req, ctx.res, {
        target,
        headers
    }, (e) => {
        const status = {
            ECONNREFUSED: 503,
            ETIMEOUT: 504,
        }[e.code];
        if (status) {
            ctx.res.statusCode = status;
            ctx.res.end('has error' + e.code);
        }else{
            ctx.res.statusCode = 506;
            ctx.res.end('has error' + 'NO DETAIL')
        }
    });
})

module.exports = router;
