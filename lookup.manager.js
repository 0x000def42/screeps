module.exports = {
  rooms() {
    return Object.values(Game.rooms)
  },
  roomSpawner(room){
    return room.find(FIND_MY_SPAWNS)[0]
  },
  findCreeps(room, role, tier){
    return room.find(FIND_MY_CREEPS, {
      filter: object =>  { 
        return object.memory.role == role && object.memory.tier == tier
      }
    })
  },
  resourceBuildings(room){
    const useSpawner = global.spawnManager.spawnNeeds(room)[0]
    const targets = room.find(FIND_STRUCTURES, {
      filter: (structure) => {
          return ((structure.structureType == STRUCTURE_SPAWN && 
                    (useSpawner || structure.store.getFreeCapacity(RESOURCE_ENERGY) > 150) ) ||
                  structure.structureType == STRUCTURE_TOWER ||
                  structure.structureType == STRUCTURE_EXTENSION) && 
                  structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });
    return targets
  },
  nearestResourceBuildings(creep){
    const useSpawner = global.spawnManager.spawnNeeds(creep.room)[0]
    const targets = creep.pos.findInRange(FIND_STRUCTURES, 5, {
      filter: (structure) => {
          return ((structure.structureType == STRUCTURE_SPAWN && 
                    (useSpawner || structure.store.getFreeCapacity(RESOURCE_ENERGY) > 150) ) ||
                  structure.structureType == STRUCTURE_TOWER ||
                  structure.structureType == STRUCTURE_EXTENSION) && 
                  structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
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