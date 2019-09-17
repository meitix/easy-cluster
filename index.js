const cluster = require("cluster");
const os = require("os");

function runWithCluster(runApp) {
  if (cluster.isMaster) {
    forkCluster(cluster, os.cpus().length);
    bindClusterStartAndDieEventHandlers(cluster);
  } else {
    runApp();
  }
}

function forkCluster(cluster, count) {
  for (let i = 0; i < count; i++) {
    cluster.fork();
  }
}

function logClusterDied(worker, code, signal) {
  console.log(
    `cluster ${worker.id} died with ${JSON.stringify({ code, signal })}`
  );
}

function logClusterStarted(worker) {
  console.log(`cluster is online: ${worker.id}`);
}

function bindClusterStartAndDieEventHandlers(cluster) {
  cluster.on("exit", logClusterDied);
  cluster.on("exit", () => forkCluster(cluster, 1));
  cluster.on("online", logClusterStarted);
}

module.exports = runWithCluster;