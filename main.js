var constants = require('constants');
var utils = require('utils');

var roleBuilder = require('role.builder');
var roleDefender = require('role.defender');
var roleHarvester = require('role.harvester');
var roleRepairer = require('role.repairer');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function() {
    
    //
    // Basic debug information every 100 ticks
    //
    if (Game.time % 100 == 0) { 
        console.log('------------------------------------------------------------');
        for (var i = 0; i < constants.maxCreeps.length; i++) {
    
            var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == constants.maxCreeps[i].creepType);
            console.log(constants.maxCreeps[i].creepType + " \t: " + creeps.length);
        }
        console.log('------------------------------------------------------------');
    }
    
    //
    // Loop through creeps, looking for deleted ones
    //
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existent creep memory:', name);
        }
    }
    
    //
    // Loop through my rooms
    //
    for (var roomName in Game.rooms) {
        //
        // If there are less creeps than the max, spawn them
        //
        utils.spawnCreeps(roomName);
        
        //
        // Defend the room!
        //
        utils.defendRoom(roomName);
    }
    
    //
    // Loop through each creep and perform their role function
    //
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        
        switch (creep.memory.role) {
            
            case 'builder':
                roleBuilder.run(creep);
                break;
                
            case 'defender':
                roleDefender.run(creep);
                break;
                
            case 'harvester':
                roleHarvester.run(creep);
                break;
                
            case 'repairer':
                roleRepairer.run(creep);
                break;
                
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
            
        }
        
    }
    
}