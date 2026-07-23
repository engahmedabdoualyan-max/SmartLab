// Base interface for assistant agents
class AssistantAgent extends Agent {
    constructor(name, coordinator) {
        super(name, 'assistant', coordinator);
    }
}