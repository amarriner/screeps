var constants = require('constants');
var utils = require('utils');

var roleBuilder = require('role.builder');
var roleDefender = require('role.defender');
var roleHarvester = require('role.harvester');
var roleMiner = require('role.miner');
var roleRepairer = require('role.repairer');
var roleScout = require('role.scout');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function() {

    var name;
    
    //
    // Basic debug information every 100 ticks
    //
    if (Game.time % 100 === 0) { 
        
        utils.printDebugInfo();        

    }
    
    //
    // Loop through creeps, looking for deleted ones
    //
    for(name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('---- Clearing non-existent creep memory:', name);
        }
    }
    
    //
    // Loop through my rooms
    //
    for (var roomName in Game.rooms) {
        
        //
        // Check and store room level
        //
        if (!Memory.rooms)                      { Memory.rooms = {}; }
        if (!Memory.rooms[roomName])            { Memory.rooms[roomName] = {}; }
        if (!Memory.rooms[roomName].controller) { Memory.rooms[roomName].controller = {}; }
        
        if (Memory.rooms[roomName].controller.level != Game.rooms[roomName].controller.level) {
            
            var message = 'Room ' + roomName + ' has changed level from ' +
                            Memory.rooms[roomName].controller.level + ' to ' +
                            Game.rooms[roomName].controller.level;
                            
            Game.notify(message);
                        
            console.log('==== ' + message);
            
        }
        
        Memory.rooms[roomName].controller.level = Game.rooms[roomName].controller.level;
        
        //
        // If there are less creeps than the max, spawn them
        //
        utils.spawnCreeps(roomName);
        
        //
        // Defend the room!
        //
        utils.defendRoom(roomName);

        //
        // Every so often, check to see if we can build more extensions, and do so
        //
        if (utils.canBuildExtensions(Game.rooms[roomName]) && Game.time % 500) {
            utils.buildExtensions(roomName);
        }
    }
    
    //
    // Loop through each creep and perform their role function
    //
    for (name in Game.creeps) {
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
                
            case 'miner':
                roleMiner.run(creep);
                break;
                
            case 'repairer':
                roleRepairer.run(creep);
                break;
                
            case 'scout':
                roleScout.run(creep);
                break;
                
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
            
        }
        
    }
    
};