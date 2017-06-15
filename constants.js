
module.exports = {
    
    maxCreeps: [
        {creepType: 'harvester', max: 5},
        {creepType: 'builder', max: 5},
        {creepType: 'upgrader', max: 5},
        {creepType: 'repairer', max: 5},
    ],
    
    buildSort: [
        STRUCTURE_EXTENSION,
    ],
    
    defaultCreepParts: [WORK, CARRY, MOVE, MOVE]
    
};