module.exports = {
  rooms() {
    return Object.values(Game.rooms)
  },
  roomSpawner(room){
    return room.find(FIND_MY_SPAWNS)[0]
  },
  tier1Workers(room){
    return room.find(FIND_MY_CREEPS, {
      filter: object =>  { 
        return object.memory.role == 'worker' && object.memory.tier == 1
      }
    })
  },
  resourceBuildings(room){
    const useSpawner = global.spawnManager.spawnNeeds(room)[0]
    const targets = room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        const minCapacity = structure.structureType == STRUCTURE_SPAWN ? 50 : 0 
          return (structure.structureType == STRUCTURE_EXTENSION ||
                  (structure.structureType == STRUCTURE_SPAWN && useSpawner ) ||
                  structure.structureType == STRUCTURE_TOWER) && 
                  structure.store.getFreeCapacity(RESOURCE_ENERGY) > minCapacity;
        }
    });
    return targets
  },

  roomSources(room){
    return room.find(FIND_SOURCES)
  },
  nearestAvailableSource(creep){
    return creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE)
  }
}