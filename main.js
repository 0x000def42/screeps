const towerManager = require('./tower.manager');

global.lookupManager = require('./lookup.manager');
global.spawnManager = require('./spawn.manager');
global.roleWorker = require('./role.worker');
global.towerManager = require('./tower.manager')

module.exports.loop = function () {
  for(var name in Memory.creeps) {
    if(!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log('Clearing non-existing creep memory:', name);
    }
  }
  lookupManager.rooms().forEach(room => {
    spawnManager.run(room)
    towerManager.run(room)
  });

  for(var name in Game.creeps) {
    var creep = Game.creeps[name];
    if(creep.memory.role == 'worker') {
      if(!creep.memory.action){
        roleWorker.lookupAction(creep)
      }
      roleWorker.run(creep);
    }
  }
}