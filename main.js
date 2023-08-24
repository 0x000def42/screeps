// https://github.com/screepers/screeps-profiler
global.profiler = require('screeps-profiler');
global.lookupManager = require('./lookup.manager');
global.spawnManager = require('./spawn.manager');
global.roleWorker = require('./role.worker');
global.towerManager = require('./tower.manager')

profiler.registerClass(global.lookupManager, 'LookupManager')
profiler.registerClass(global.spawnManager, 'SpawnManager')
profiler.registerClass(global.roleWorker, 'RoleWorker')
profiler.registerClass(global.towerManager, 'TowerManager')

profiler.enable();
module.exports.loop = function () {
  profiler.wrap(
    function(){
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
        if(!creep.memory.action){
          roleWorker.lookupAction(creep)
        }
        roleWorker.run(creep);
        if(!creep.memory.action){
          roleWorker.lookupAction(creep)
          roleWorker.run(creep);
        }
      }
    }
  )

}