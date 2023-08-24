const TIER_ONE_WORKER = {
  body: [WORK, CARRY, MOVE],
  memory: {
    role: 'worker',
    tier: 1
  },
  name: 'T1 Worker'
}

const TIER_TWO_WORKER = {
  body: [WORK, CARRY, MOVE, WORK],
  memory: {
    role: 'worker',
    tier: 2
  },
  name: 'T2 Worker'
}

module.exports = {
  run: function (room) {
    const spawner = global.lookupManager.roomSpawner(room)
    if(spawner.spawning) { 
      const spawningCreep = Game.creeps[spawner.spawning.name];
        room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            spawner.pos.x + 1, 
            spawner.pos.y, 
            {align: 'left', opacity: 0.8});
    } else {
      const spawnNeed = this.spawnNeeds(room)[0]
      if(spawnNeed){
        spawnCreep(spawner, spawnNeed)
      }
    }
  },
  spawnNeeds(room){
    const needs = []
    
    this.spawnNeedConfig(room).forEach(([template, count]) => {
      if(global.lookupManager.findCreeps(room, template.memory.role, template.memory.tier).length < count){
        needs.push(template)
      }
    })
    return needs
  },
  spawnNeedConfig(room){
    if(room.controller.level == 1){
      return [
        [TIER_ONE_WORKER, 2]
      ]
    } else if(room.controller.level == 2){
      return [
        [TIER_ONE_WORKER, 1],
        [TIER_TWO_WORKER, 2]
      ]
    }

    return []
  }
}

function spawnCreep(spawner, creepTemplate){
  const newName = creepTemplate.name + ' ' + Game.time
  const spawnResult = spawner.spawnCreep(creepTemplate.body, newName, {
    memory: creepTemplate.memory,
    energyStructures: [
      ...spawner.room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }}),
      global.lookupManager.roomSpawner(spawner.room)
    ]
  })
}

