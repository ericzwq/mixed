import redis = require('redis')
const client = redis.createClient({url: 'redis://127.0.0.1:6379'})

client.on('error', (err: unknown) => console.log('Redis Client Error', err))

export default client
