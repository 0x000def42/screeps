const TIER_ONE = 1
const TIER_TWO = 2
const TIER_THREE = 3

const UPGRADER = 'upgrader'
const WORKER = 'worker'
const MOVER = 'mover'
const SUICIDER = 'suicider'

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
    allow: !!building && creep.store[RESOURCE_ENERGY] != 0
  }
}]

const TRANSFER_NEAREST = ['transfer', (creep) => {
  const building = global.lookupManager.nearestResourceBuildings(creep)[0]
  return {
    target: () => building,
    allow: !!building && creep.store[RESOURCE_ENERGY] != 0
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
  const spawnNeeds = global.spawnManager.isSpawnNeeds(creep.room)
  const spawner = global.lookupManager.roomSpawner(creep.room)
  return {
    target: () => spawner,
    allow: creep.store[RESOURCE_ENERGY] == 0 && spawnNeeds && spawner.store.getFreeCapacity(RESOURCE_ENERGY) < 70
  }
}]

const FORCE_WITHDRAW_ACTION = ['withdraw', (creep) => {
  const spawner = global.lookupManager.roomSpawner(creep.room)
  const spawnNeeds = global.spawnManager.isSpawnNeeds(creep.room)
  return {
    target: () => spawner,
    allow: creep.store[RESOURCE_ENERGY] == 0 && !spawnNeeds
  }
}]

const FORCE_WITHDRAW_NEAREST_TOMBSTONE = ['withdraw', (creep) => {
  const tombstone = creep.pos.findInRange(FIND_TOMBSTONES, 3)[0];
  return {
    target: () => tombstone,
    allow: creep.store[RESOURCE_ENERGY] == 0 && !!tombstone
  }
}]

const SUICIDE_ACTION = ['suicide', (creep) => {
  const spawner = global.lookupManager.roomSpawner(creep.room)
  return {
    target: () => spawner,
    allow: spawner.store.getFreeCapacity(RESOURCE_ENERGY) >= 100 && creep.store[RESOURCE_ENERGY] == 0
  }
}]

const PICKUP_ACTION = ['pickup', (creep) => {
  let target
  if(!target){
    target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES)
  }

  return {
    target: () => target,
    allow: !!target && creep.store[RESOURCE_ENERGY] == 0
  }
}]

const roleWorker = {
  lookupAction: function(creep){
    const priorities = this.creepWorkPriorities(creep)
    if(!priorities) return
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
    priorities[TIER_ONE + WORKER] = [
      WITHDRAW_ACTION,
      HARVEST_ACTION,
      TRANSFER_ACTION,
      UPGRADE_ACTION
    ]
    priorities[TIER_TWO + WORKER] = [
      HARVEST_ACTION,
      TRANSFER_NEAREST,
      BUILD_ACTION,
    ]
    priorities[TIER_THREE + UPGRADER] = [
      FORCE_WITHDRAW_ACTION,
      UPGRADE_ACTION
    ]
    priorities[TIER_THREE + SUICIDER] = [
      FORCE_WITHDRAW_NEAREST_TOMBSTONE,
      PICKUP_ACTION,
      TRANSFER_NEAREST,
      SUICIDE_ACTION
    ]

    return priorities[creep.memory.tier + creep.memory.role]
  },
  run: function(creep){
    if(!creep.memory.action && creep.memory.role != 'mover'){
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
    } else if (action == 'suicide'){
      actionResult = target.recycleCreep(creep)
    } else if (action == 'pickup'){
      actionResult = creep.pickup(target)
    }

    if(actionResult == OK || actionResult == ERR_BUSY) return
    if(actionResult == ERR_NOT_IN_RANGE) {
      const moveResult = creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
      if(moveResult == ERR_TIRED && creep.getActiveBodyparts(MOVE) == 0){
        console.log('here')
      }
    } else if(actionResult == ERR_NOT_ENOUGH_RESOURCES) {
      return this.flushAction(creep)
    } else if (actionResult == ERR_INVALID_TARGET || actionResult == ERR_FULL){
      console.log(creep.memory.role, action, actionResult)
      this.flushAction(creep)
    } else {
      console.log(creep.memory.role, action, actionResult)
    }

    
  },
  flushAction(creep){
    creep.memory.action = undefined
    creep.memory.targetId = undefined
  }
}

module.exports = roleWorker