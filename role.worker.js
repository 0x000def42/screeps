const TIER_ONE = 1
const TIER_TWO = 2

const HARVEST_ACTION = ['harvest', (creep) => {
  return {
    target: () => global.lookupManager.nearestAvailableSource(creep),
    allow: creep.store[RESOURCE_ENERGY] == 0
  }
}]

const TRANSFER_ACTION = ['transfer', (creep) => {
  const building = global.lookupManager.resourceBuildings(creep.room)[0]
  return {
    target: () => building,
    allow: !!building
  }
}]

const TRANSFER_NEAREST = ['transfer', (creep) => {
  const building = global.lookupManager.nearestResourceBuildings(creep)[0]
 
  return {
    target: () => building,
    allow: !!building
  }
}]

const UPGRADE_ACTION = ['upgrade', (creep) => {
  return {
    target: () => creep.room.controller,
    allow: true
  }
}]

const BUILD_ACTION = ['build', (creep) => {
  const site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
  return {
    target: () => site,
    allow: !!site
  }
}]

const WITHDRAW_ACTION = ['withdraw', (creep) => {
  const spawnNeeds = global.spawnManager.spawnNeeds(creep.room)[0]
  const spawner = global.lookupManager.roomSpawner(creep.room)
  return {
    target: () => spawner,
    allow: creep.store[RESOURCE_ENERGY] == 0 && !spawnNeeds && spawner.store.getFreeCapacity(RESOURCE_ENERGY) < 70
  }
}]

const roleWorker = {
  lookupAction: function(creep){
    const priorities = this.creepWorkPriorities(creep)
    priorities.find(([actionName, actionPolicy]) => {
      const policy = actionPolicy(creep)
      if(policy.allow){
        creep.memory.action = actionName
        creep.memory.targetId = policy.target().id
        return true
      }

      return false
    });
  },
  creepWorkPriorities: function(creep){
    const priorities = {}
    priorities[TIER_ONE] = [
      WITHDRAW_ACTION,
      HARVEST_ACTION,
      TRANSFER_ACTION,
      UPGRADE_ACTION
    ]
    priorities[TIER_TWO] = [
      HARVEST_ACTION,
      TRANSFER_NEAREST,
      BUILD_ACTION,
      TRANSFER_ACTION,
      UPGRADE_ACTION
    ]

    return priorities[creep.memory.tier]
  },
  run: function(creep){
    if(!creep.memory.action){
      return console.log('Creep has no action', creep.memory.role, creep.memory.tier)
    }
    const action = creep.memory.action
    const target = Game.getObjectById(creep.memory.targetId)
    let actionResult
    if( action == 'harvest') {
      actionResult = creep.harvest(target)

      if(creep.store.getFreeCapacity() == 0){
        return this.flushAction(creep)
      }
    } else if (action == 'transfer') {
      actionResult = creep.transfer(target, RESOURCE_ENERGY)
    } else if (action == 'upgrade') {
      actionResult = creep.upgradeController(target)
      
    } else if (action == 'build') {
      actionResult = creep.build(target)
    } else if (action == 'withdraw'){
      actionResult = creep.withdraw(target, RESOURCE_ENERGY)
    }

    if(actionResult == OK || actionResult == ERR_BUSY) return
    if(actionResult == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
    } else if(actionResult == ERR_NOT_ENOUGH_RESOURCES) {
      return this.flushAction(creep)
    } else if (actionResult == ERR_INVALID_TARGET || actionResult == ERR_FULL){
      console.log(action, actionResult)
      this.flushAction(creep)
    } else {
      console.log(action, actionResult)
    }

    
  },
  flushAction(creep){
    creep.memory.action = undefined
    creep.memory.targetId = undefined
  }
}

module.exports = roleWorker