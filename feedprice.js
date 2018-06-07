
const config = require('./config.json')
const http = require('http')
const request = require('request')
const steem = require('steem')
const nodes = ["https://api.steemit.com","https://steemd.minnowsupportproject.org","https://steemd.privex.io"]

steem.api.setOptions({ url: nodes[0] })

let cache = {}

function runFeedPrice(){
	console.log('runFeedPrice')

    request({
        url: 'https://api.coinmarketcap.com/v2/ticker/1230/'
    }, function (error, response, body) {

		if(!error && response.statusCode == 200){
           let json = JSON.parse(body)

			if(json.data){

				let exchangeRate = { base: json.data.quotes.USD.price.toFixed(3) + ' SBD', quote: '1.000 STEEM' }

				steem.broadcast.feedPublish(config.wif, config.name, exchangeRate, function(err, result) {
					console.log(err, result)
					if(err){

						if(err.message.indexOf('Invalid WIF key') !== -1){
							cache.status = 'Invalid WIF key'
						}else if(err.message.indexOf('Non-base58 character') !== -1){
							cache.status = 'Non-base58 character WIF key'
						}else{
							cache.status = 'Other error'
						    changeNode()
							runFeedPrice()	
						}

					}else{
						cache.exchangeRate = exchangeRate
						cache.timestamp = new Date()
						cache.status = 'success'					
					}

					console.log(cache.status)
				})
			}
        }
    });
}


function feedAge(){
	let difference = new Date().getTime() - new Date(cache.timestamp).getTime()
	let calSecond = Math.floor(difference/1000)
	let feedAge = (calSecond/60).toFixed(0)
	cache.feedAge = feedAge + ' min ago'
}

function changeNode() {
	console.log('changeNode')
	let index = nodes.indexOf(steem.api.options.url) + 1

	if (index == nodes.length)
		index = 0

	steem.api.setOptions({ url: nodes[index] })
}


// runFeedPrice()

// timer
setInterval(runFeedPrice, config.interval * 60 * 1000)

//create a server object:
http.createServer(function (req, res) {

	feedAge()
	res.write(JSON.stringify(cache))
	res.end()
}).listen(config.port,function(){
	console.log('Http server listening on port : ' + config.port)
}) 



