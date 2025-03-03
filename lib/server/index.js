var cluster = require('cluster');
const { logEvent } = require('../../logger'); // Import del logger

function Server(serverconfig, application){
    this.config = serverconfig;
    this.application = application;
}

// Método que arranca el proceso master (maneja el cluster de workers)
Server.prototype.startmaster = function(){
    var nworkers = this.config.server.nworkers || require('os').cpus().length;

    console.info('Master cluster setting up ' + nworkers + ' workers...');
    logEvent(`Master cluster setting up ${nworkers} workers...`)
      .catch(err => console.error("Error al loggear en startmaster:", err));

    for(var i = 0; i < nworkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.info('Worker ' + worker.process.pid + ' is online');
        logEvent(`Worker ${worker.process.pid} is online`)
          .catch(err => console.error("Error al loggear worker online:", err));
    });

    cluster.on('exit', function(worker, code, signal) {
        console.warn(`Worker ${worker.process.pid} died with code: ${code}, signal: ${signal}`);
        logEvent(`Worker ${worker.process.pid} died with code: ${code}, signal: ${signal}`)
          .catch(err => console.error("Error al loggear worker exit:", err));

        // Si el worker muere por razones distintas a 78, se crea un nuevo worker
        if (code !== 78){
            console.warn('Starting a new worker');
            logEvent('Starting a new worker...')
              .catch(err => console.error("Error al loggear new worker:", err));
            cluster.fork();
        }
    });

    if ((process.platform !== 'win32')) {
        process.on('SIGINT', function () {
            process.exit(0);
        });
        process.on('exit', function (code) {
            if (code === 0) {
                console.log(`\bbotkit: master [PID ${process.pid}] stopped`);
                console.log('\033[1Gbye');
                logEvent(`Master [PID ${process.pid}] stopped gracefully`)
                  .catch(err => console.error("Error al loggear en master stop:", err));
                return;
            }
            console.log(`botkit: master [PID ${process.pid}] exiting with code ${code}`);
            logEvent(`Master [PID ${process.pid}] exiting with code ${code}`)
              .catch(err => console.error("Error al loggear en master exit:", err));
        });
    }
};

Server.prototype.startcluster = function(){
    if(cluster.isMaster){
        return this.startmaster();
    }
    this.startworker();
};

// Método que arranca un worker (proceso hijo)
Server.prototype.startworker = function(){
    var self    = this;
    var app     = this.application.load();
    var server  = app.listen(this.config.server.port , function(){
        var host = server.address().address;
        var port = server.address().port;
        console.info('Worker listening at http://%s:%s', host, port);
        // Log de que el worker se levantó correctamente
        logEvent(`Worker [PID ${process.pid}] listening at http://${host}:${port}`)
          .catch(err => console.error("Error al loggear startworker:", err));
    });

    server.on('error', function (err) {
        switch (err.code) {
            case 'EADDRINUSE':
                console.error('botkit: worker %d [PID: %d] failed to listen on port %d [EADDRINUSE]',
                    cluster.worker && cluster.worker.id, process.pid, self.config.server.port);
                logEvent(`Worker [PID ${process.pid}] failed to listen on port ${self.config.server.port} [EADDRINUSE]`)
                  .catch(e => console.error("Error al loggear error EADDRINUSE:", e));
                process.exit(78);
                break;
            case 'EACCES':
                console.error('botkit: worker %d [PID: %d] cannot access port %d [EACCES]',
                    cluster.worker && cluster.worker.id, process.pid, self.config.server.port);
                logEvent(`Worker [PID ${process.pid}] cannot access port ${self.config.server.port} [EACCES]`)
                  .catch(e => console.error("Error al loggear error EACCES:", e));
                process.exit(78);
                break;
            default:
                console.error(`Unknown error in worker [PID ${process.pid}]: ${err.message}`);
                logEvent(`Worker [PID ${process.pid}] unknown error: ${err.message}`)
                  .catch(e => console.error("Error al loggear error default:", e));
                self.shutdown();
                server.close();
                break;
        }
    });
};

// Método de arranque que decide si usar cluster o worker simple
Server.prototype.start = function(){
    if(this.config.server.cluster !== true){
        return this.startworker();
    } else {
        return this.startcluster();
    }
};

Server.prototype.shutdown = function() {
    var shutdownTimer = setTimeout(function () {
        process.exit(1);
    }, 5000);
    shutdownTimer.unref();

    return shutdownTimer;
};

module.exports = Server;
