var utils = require('utils');

var roleBuilder = {
    
    /** param {Creep} creep **/
    run: function(creep) {
        
        //
        // If the creep is currently building, but has is not carrying
        // any energy
        // OR
        // if the constructionSite in memory no longer exists:
        // set the building memory flag to false
        //
        if ((creep.memory.building && creep.carry.energy == 0) ||
            !Game.getObjectById(creep.memory.constructionSite)) {
            creep.memory.building = false;
            creep.memory.constructionSite = undefined;
        }
        
        //
        // If the creep is not building, and is carrying its full
        // capacity of enery, set the building memory flag to true
        //
        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
        }
        
        //
        // If this creep should be (or is already) building
        //
        if(creep.memory.building) {
            
            //
            // Reset creep's harvesting flag
            //
            creep.memory.harvesting = undefined;
            
            //
            // If we're already at a construction site and currently building,
            // don't bother looking for other sites
            //
            if (creep.memory.constructionSite) {
                creep.build(Game.constructionSites[creep.memory.constructionSite]);
            }
            
            else {
                
                //
                // Find any construction sites in this room, sorted by priorty
                //
                var targets = utils.sortConstructionSites(creep.room.find(FIND_CONSTRUCTION_SITES));

                if(targets.length) {    
                    //
                    // Attempt to build 
                    //
                    if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    
                        //
                        // Couldn't build, too far away. Move to the site
                        //
                        creep.moveTo(targets[0], {
                            visualizePathStyle: { 
                                stroke: '#fff', 
                                lineStyle: 'solid',
                                opacity: .75
                            }
                        });
                    
                    }
                
                    //
                    // If successful, store the site we've built on
                    //
                    else {
                        creep.memory.constructionSite = targets[0].id;
                    }
                }
                
                //
                // Else no targets available to build, suicide
                //
                else {
                    creep.suicide();
                }
            }

        }
        
        //
        // Not building, harvest
        //
        else {
        
            utils.harvest(creep, creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES));
            
        }
    }
};

module.exports = roleBuilder;