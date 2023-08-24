const roleWorker = {
  lookupAction: function(creep){
    let resourceBuilding
    if(creep.store[RESOURCE_ENERGY] == 0){
      const source = global.lookupManager.nearestAvailableSource(creep)
      creep.memory.action = 'harvest'
      creep.memory.targetId = source.id
    } else if(resourceBuilding = global.lookupManager.resourceBuildings(creep.room)[0]) {
      creep.memory.action = 'transfer'
      creep.memory.targetId = resourceBuilding.id
    } else {
      creep.memory.action = 'upgrade'
      creep.memory.targetId = creep.room.controller.id
    }
  },
  run: function(creep){
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

    }
    if(actionResult == OK || actionResult == ERR_BUSY) return
    if(actionResult == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
    } else if(actionResult == ERR_NOT_ENOUGH_RESOURCES) {
      return this.flushAction(creep)
    } else {
      console.log(actionResult)
    }

    
  },
  flushAction(creep){
    creep.memory.action = undefined
    creep.memory.targetId = undefined
  }
}

module.exports = roleWorker