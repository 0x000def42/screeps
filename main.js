// var roleHarvester = require('role.harvester');
// var roleUpgrader = require('role.upgrader');
// var roleBuilder = require('role.builder');
global.lookupManager = require('./lookup.manager');
global.spawnManager = require('./spawn.manager');
global.roleWorker = require('./role.worker');

module.exports.loop = function () {
  for(var name in Memory.creeps) {
    if(!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log('Clearing non-existing creep memory:', name);
    }
  }
  lookupManager.rooms().forEach(room => {
    spawnManager.run(room)
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

  



  // var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  // console.log('Harvesters: ' + harvesters.length);

  // if(harvesters.length < 2) {
  //     var newName = 'Harvester' + Game.time;
  //     console.log('Spawning new harvester: ' + newName);
  //     Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
  //         {memory: {role: 'harvester'}});
  // }
  
  // if(Game.spawns['Spawn1'].spawning) { 
  //     var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
  //     Game.spawns['Spawn1'].room.visual.text(
  //         '🛠️' + spawningCreep.memory.role,
  //         Game.spawns['Spawn1'].pos.x + 1, 
  //         Game.spawns['Spawn1'].pos.y, 
  //         {align: 'left', opacity: 0.8});
  // }

  // var tower = Game.getObjectById('e9ea0207c8447ca3c7323128');
  // if(tower) {
  //     var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
  //         filter: (structure) => structure.hits < structure.hitsMax
  //     });
  //     if(closestDamagedStructure) {
  //         tower.repair(closestDamagedStructure);
  //     }

  //     var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  //     if(closestHostile) {
  //         tower.attack(closestHostile);
  //     }
  // }

  // for(var name in Game.creeps) {
//     var creep = Game.creeps[name];
//     if(creep.memory.role == 'harvester') {
//         roleHarvester.run(creep);
//     }
//     if(creep.memory.role == 'upgrader') {
//         roleUpgrader.run(creep);
//     }
//     if(creep.memory.role == 'builder') {
//         roleBuilder.run(creep);
//     }
  // }
}