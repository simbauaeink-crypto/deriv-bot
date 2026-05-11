// ============================================
// ISLAMOTIC REAL TRADING BOT
// Connects to Deriv API - REAL ACCOUNT READY
// ============================================

const WebSocket = require('ws');

const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Deriv Trading Bot</title>
            <style>
                body{
                    background:black;
                    color:lime;
                    font-family:Arial;
                    text-align:center;
                    padding-top:100px;
                }
                h1{
                    font-size:50px;
                }
            </style>
        </head>
        <body>
            <h1>🚀 Deriv Bot Live</h1>
            <p>Trading bot connected successfully.</p>
        </body>
        </html>
    `);
});

app.listen(process.env.PORT || 8080, () => {
    console.log("Web server running");
});

// CONFIGURATION
const APP_ID = 1089;
const API_TOKEN ='0UZnZUbzYb2viMw';
let lastTradeTime = 0;
// ================================================
const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=' + APP_ID);

console.log('🤖 Islamotic Bot Starting...');
console.log('📡 Connecting to Deriv API...');
ws.on('open', function() {
    console.log('✅ WebSocket Connected!');
    console.log('🔐 Authorizing with API token...');
    ws.send(JSON.stringify({ "authorize": API_TOKEN }));
});

ws.on('message', function(msg) {
    const data = JSON.parse(msg);
    
    // Handle authorization response
    if (data.msg_type === 'authorize') {
        if (data.error) {
            console.log('❌ Authorization Failed:', data.error.message);
            console.log('💡 Make sure your API token is correct!');
            ws.close();
        } else {
            console.log('✅ Authorized! Account ID:', data.authorize.loginid);
            console.log('💰 Balance:', data.authorize.balance, data.authorize.currency);
            
            // Now let's subscribe to live prices for R_100
            console.log('📊 Subscribing to R_100 price ticks...');
            ws.send(JSON.stringify({ "ticks": "R_100" }));
        }
    }
    
    // Handle price ticks (live market data)
    if (data.msg_type === 'tick') {
        const price = data.tick.quote;
     console.log("R_100 Price:", price);
if (price > 454.50) {

   if (Date.now() - lastTradeTime < 10000) return;
   lastTradeTime = Date.now();

    console.log("BUY SIGNAL DETECTED");

    ws.send(JSON.stringify({
        "buy": 1,
        "price": 10,
        "parameters": {
            "amount": 1,
            "basis": "stake",
            "contract_type": "CALL",
            "currency": "USD",
            "duration": 1,
            "duration_unit": "m",
            "symbol": "R_100"
        }
    }));
}   
        const time = new Date().toLocaleTimeString();
        console.log(`📈 ${time} | R_100 Price: ${price}`);
        
        // You can add your trading logic here!
        // For example, if price > certain value, place a trade
    }
    
    // Handle buy response
    if (data.msg_type === 'buy') {
        if (data.error) {
            console.log('❌ Trade Failed:', data.error.message);
        } else {
            console.log('🎉 TRADE EXECUTED!');
            console.log('   Contract ID:', data.buy.contract_id);
            console.log('   Longcode:', data.buy.longcode);
        }
    }
    
    // Handle errors
    if (data.error && data.msg_type !== 'authorize') {
        console.log('⚠️ API Error:', data.error.message);
    }
});

ws.on('error', function(error) {
    console.log('❌ WebSocket Error:', error.message);
});

ws.on('close', function() {
    console.log('🔌 Connection closed');
});

// Keep the bot running
console.log('✅ Bot is running. Press Ctrl+C to stop.');