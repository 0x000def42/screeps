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

const TIER_THREE_UPGRADER = {
  body: [WORK, WORK, WORK, WORK, WORK, CARRY],
  memory: {
    role: 'upgrader',
    tier: 3
  },
  name: 'T3 Upgrader'
}

const TIER_THREE_MOVER = {
  body: [MOVE, MOVE],
  memory: {
    role: 'mover',
    tier: 3
  },
  name: 'T3 Mover'
}

const SUICIDER = {
  body: [MOVE, CARRY],
  memory: {
    role: 'suicider',
    tier: 3
  },
  name: 'T3 Suicider'
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
  isSpawnNeeds(room){
    return !!this.spawnNeeds(room).filter((template) => template.memory.role != 'suicider')[0]
  },
  spawnNeedConfig(room){
    if(room.controller.level == 1){
      return [
        [TIER_ONE_WORKER, 2]
      ]
    } else if(room.controller.level == 2){
      return [
        [TIER_ONE_WORKER, 1],
        [TIER_TWO_WORKER, 3]
      ]
    } else if(room.controller.level == 3){
      return [
        [TIER_ONE_WORKER, 1],
        [TIER_TWO_WORKER, 2],
        [TIER_THREE_UPGRADER, 2],
        // [TIER_THREE_MOVER, 1],
        [SUICIDER, 2]
      ]
    }

    return []
  }
}

function spawnCreep(spawner, creepTemplate){
  const newName = creepTemplate.name + ' ' + Game.time
  const energyStructures = [...spawner.room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }})]
  if(creepTemplate.memory.role != 'suicider'){
    energyStructures.push(global.lookupManager.roomSpawner(spawner.room))
  }
  const spawnResult = spawner.spawnCreep(creepTemplate.body, newName, {
    memory: creepTemplate.memory,
    energyStructures: energyStructures,
  })
}

