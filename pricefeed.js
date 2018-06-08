
const config = require('./config.json')
const request = require('request')
const steem = require('steem')
const nodes = ["https://api.steemit.com","https://steemd.minnowsupportproject.org","https://steemd.privex.io"]


steem.api.setOptions({ url: nodes[0] })

let cache = {name:config.name,interval:config.interval}

function exchangeRate(){
    request({
        url: 'https://api.coinmarketcap.com/v2/ticker/1230/'
    }, function (error, response, body) {

		if(!error && response.statusCode == 200){
           let json = JSON.parse(body)
			if(json.data){
				let exchangeRate = { base: json.data.quotes.USD.price.toFixed(3) + ' SBD', quote: '1.000 STEEM' }
				feedPublish(exchangeRate)
			}
        }
    });
}

function feedPublish(_exchangeRate){
	steem.broadcast.feedPublish(config.wif, config.name, _exchangeRate, function(err, result) {
		console.log(err, result)
		if(err){

			if(err.message.indexOf('Invalid WIF key') !== -1){
				cache.status = 'Invalid WIF key'
			}else if(err.message.indexOf('Non-base58 character') !== -1){
				cache.status = 'Non-base58 character WIF key'
			}else{
				cache.status = err.message
			    changeNode()
				feedPublish(_exchangeRate)	
			}
		}else{
			cache.exchangeRate = _exchangeRate
			cache.status = 'success'					
		}
		console.log(cache)
	})
}

function changeNode() {
	console.log('changeNode')
	let index = nodes.indexOf(steem.api.options.url) + 1

	if (index == nodes.length)
		index = 0

	cache.node = nodes[index]
	steem.api.setOptions({ url: nodes[index] })
}


// timer
setInterval(exchangeRate, config.interval * 60 * 1000)

console.log(cache)



