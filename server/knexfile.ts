import path from 'path';

module.exports = {
    client: 'mysql', // CREATE DATABASE "ecoleta" FIRST !
    connection: {
        host : '127.0.0.1',
        user : 'amintasvrp',
        password : 'smart02-',
        database: "ecoleta",
    },
    migrations: {
        directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
    },
    seeds: {
        directory: path.resolve(__dirname, 'src', 'database', 'seeds'),
    }
}