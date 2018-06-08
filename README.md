# steem price feed 
steem price feed for witness.

# steem price
Use coinmarketcap api.

# install
```npm install```

# config
name : "your steem acoount name"  
wif : "your steem private key"  
interval : minute 

e.g.
```
{
    "name": "koinbot",
    "wif": "5J********************",
    "interval": 60
}
```


# run
```node feedprice.js```  
or  
```forever start feedprice.js```  //A simple CLI tool for ensuring that a given script runs continuously

