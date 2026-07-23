const Agent = require('./agent-base');

class AssistantAgent extends Agent {
    constructor(name, coordinator) {
        super(name, 'assistant', coordinator);
    }
}

module.exports = AssistantAgent;