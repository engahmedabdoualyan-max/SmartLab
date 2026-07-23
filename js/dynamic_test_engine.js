// ================================================================
// SmartLAP Dynamic Test Engine
// ================================================================
// This module provides a dynamic test creation and execution system
// supporting Dual-Mode (Manual / Hardware IoT) operation.
// 
// Classes:
//   DynamicField        - Represents a test parameter field
//   EquationEvaluator   - Safely evaluates mathematical formulas
//   DualModeController  - Manages Manual/Hardware mode switching
// ================================================================

// ---------- DYNAMIC FIELD CLASS ----------

/**
 * Represents a single dynamic field/parameter in a test definition.
 * Can be Numeric, Text, or linked to a hardware sensor.
 */
class DynamicField {
    /**
     * @param {string} fieldId - Unique identifier for this field
     * @param {string} fieldName - Human-readable display name
     * @param {string} dataType - 'Numeric' | 'Text' | 'SensorInput'
     * @param {string|null} linkedSensorId - Optional sensor ID for hardware mode
     * @param {*} defaultValue - Initial value (default: null)
     */
    constructor(fieldId, fieldName, dataType, linkedSensorId = null, defaultValue = null) {
        if (!fieldId || typeof fieldId !== 'string') {
            throw new Error('DynamicField: fieldId must be a non-empty string');
        }
        if (!fieldName || typeof fieldName !== 'string') {
            throw new Error('DynamicField: fieldName must be a non-empty string');
        }
        const validTypes = ['Numeric', 'Text', 'SensorInput'];
        if (!validTypes.includes(dataType)) {
            throw new Error('DynamicField: dataType must be one of: ' + validTypes.join(', '));
        }

        /** @type {string} Unique identifier */
        this.FieldID = fieldId;

        /** @type {string} Display name for UI */
        this.FieldName = fieldName;

        /** @type {string} Data type: Numeric, Text, or SensorInput */
        this.DataType = dataType;

        /** @type {string|null} ID of linked hardware sensor (for SensorInput type) */
        this.LinkedSensorID = linkedSensorId || null;

        /** @type {*} Current stored value */
        this.CurrentValue = defaultValue !== null ? defaultValue : this._getDefaultForType();
    }

    /**
     * Returns the data-type-appropriate default value.
     * @returns {*}
     * @private
     */
    _getDefaultForType() {
        switch (this.DataType) {
            case 'Numeric':
                return 0;
            case 'Text':
                return '';
            case 'SensorInput':
                return null;
            default:
                return null;
        }
    }

    /**
     * Update the current value with type validation.
     * @param {*} value - New value to set
     * @returns {boolean} true if value was accepted, false if rejected
     */
    setValue(value) {
        switch (this.DataType) {
            case 'Numeric':
                if (typeof value === 'number' && !isNaN(value)) {
                    this.CurrentValue = value;
                    return true;
                } else if (typeof value === 'string') {
                    const parsed = parseFloat(value);
                    if (!isNaN(parsed)) {
                        this.CurrentValue = parsed;
                        return true;
                    }
                }
                console.warn('DynamicField.setValue: Numeric field "' + this.FieldID + '" rejected non-numeric value:', value);
                return false;

            case 'Text':
                this.CurrentValue = String(value);
                return true;

            case 'SensorInput':
                if (typeof value === 'number' && !isNaN(value)) {
                    this.CurrentValue = value;
                    return true;
                } else if (typeof value === 'string') {
                    const parsed = parseFloat(value);
                    if (!isNaN(parsed)) {
                        this.CurrentValue = parsed;
                        return true;
                    }
                }
                console.warn('DynamicField.setValue: SensorInput field "' + this.FieldID + '" rejected invalid sensor value:', value);
                return false;

            default:
                return false;
        }
    }

    /**
     * Get the current value.
     * @returns {*}
     */
    getValue() {
        return this.CurrentValue;
    }

    /**
     * Reset field to its default value.
     */
    reset() {
        this.CurrentValue = this._getDefaultForType();
    }

    /**
     * Returns a plain object representation for serialization.
     * @returns {Object}
     */
    toJSON() {
        return {
            FieldID: this.FieldID,
            FieldName: this.FieldName,
            DataType: this.DataType,
            LinkedSensorID: this.LinkedSensorID,
            CurrentValue: this.CurrentValue
        };
    }

    /**
     * Create a DynamicField instance from a plain object.
     * @param {Object} obj
     * @returns {DynamicField}
     */
    static fromJSON(obj) {
        return new DynamicField(
            obj.FieldID,
            obj.FieldName,
            obj.DataType,
            obj.LinkedSensorID || null,
            obj.CurrentValue !== undefined ? obj.CurrentValue : null
        );
    }
}

// ---------- EQUATION EVALUATOR CLASS ----------

/**
 * Safely evaluates mathematical formulas expressed as strings.
 * Supports: +, -, *, /, ^ (exponentiation), parentheses, and named variables.
 * Includes explicit division-by-zero protection.
 */
class EquationEvaluator {
    constructor() {
        // No special initialization needed
    }

    /**
     * Evaluate a mathematical formula with given variables.
     *
     * Supported syntax:
     *   - Basic operators: +, -, *, /, ^
     *   - Parentheses for grouping: ( )
     *   - Named variables: e.g., "a", "b", "load", "area"
     *   - Numbers: integers and decimals (e.g., 42, 3.14)
     *
     * @param {string} formula - The formula string to evaluate (e.g., "load / (area * 1000)")
     * @param {Object} variables - Dictionary of variable name -> numeric value
     * @returns {number} The computed result
     * @throws {Error} If formula is invalid, contains division by zero, or variable is missing
     */
    EvaluateFormula(formula, variables) {
        // Input validation
        if (typeof formula !== 'string' || formula.trim().length === 0) {
            throw new Error('EquationEvaluator: formula must be a non-empty string');
        }
        if (!variables || typeof variables !== 'object') {
            throw new Error('EquationEvaluator: variables must be an object/dictionary');
        }

        // Normalize whitespace
        let expr = formula.trim();

        // --- Step 1: Replace variable names with their numeric values ---
        // Sort variable keys by length (longest first) to avoid partial replacement issues
        const varKeys = Object.keys(variables).sort(function(a, b) {
            return b.length - a.length;
        });

        for (let i = 0; i < varKeys.length; i++) {
            const key = varKeys[i];
            const val = variables[key];
            if (typeof val !== 'number' || isNaN(val)) {
                throw new Error('EquationEvaluator: variable "' + key + '" must be a number, got: ' + typeof val);
            }
            // Replace the variable name with its numeric value (word-boundary aware)
            // Use regex to match the variable name as a whole word
            const regex = new RegExp('\\b' + this._escapeRegExp(key) + '\\b', 'g');
            expr = expr.replace(regex, '(' + val + ')');
        }

        // --- Step 2: Check for remaining unknown variables (words that aren't operators/numbers) ---
        const remainingWords = expr.match(/[a-zA-Z_]\w*/g);
        if (remainingWords) {
            throw new Error(
                'EquationEvaluator: undefined variable(s) in formula: "' +
                remainingWords.join(', ') +
                '". Available variables: ' + varKeys.join(', ')
            );
        }

        // --- Step 3: Replace ^ with ** for JavaScript exponentiation ---
        expr = expr.replace(/\^/g, '**');

        // --- Step 4: Token-level validation before evaluation ---
        this._validateExpression(expr);

        // --- Step 5: Evaluate the expression with division-by-zero protection ---
        try {
            const result = this._safeEval(expr);
            if (typeof result !== 'number' || isNaN(result)) {
                throw new Error('EquationEvaluator: formula returned NaN (check your inputs)');
            }
            if (!isFinite(result)) {
                throw new Error('EquationEvaluator: formula returned infinity (possible division by zero)');
            }
            return result;
        } catch (evalErr) {
            // Re-throw evaluation errors with context
            if (evalErr.message && evalErr.message.includes('Division by zero')) {
                throw evalErr;
            }
            throw new Error('EquationEvaluator: evaluation error in "' + formula + '": ' + evalErr.message);
        }
    }

    /**
     * Escape special regex characters in a string.
     * @param {string} str
     * @returns {string}
     * @private
     */
    _escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Validate that the expression contains only safe characters and balanced parentheses.
     * @param {string} expr
     * @throws {Error} If validation fails
     * @private
     */
    _validateExpression(expr) {
        // Check for balanced parentheses
        let depth = 0;
        for (let i = 0; i < expr.length; i++) {
            if (expr[i] === '(') depth++;
            if (expr[i] === ')') depth--;
            if (depth < 0) {
                throw new Error('EquationEvaluator: mismatched parentheses (too many closing parens)');
            }
        }
        if (depth !== 0) {
            throw new Error('EquationEvaluator: mismatched parentheses (unclosed opening parens)');
        }

        // Check that only safe characters are present
        // Allowed: digits, +, -, *, /, **, ^ (already replaced), ., (, ), whitespace
        const allowedPattern = /^[\d+\-*/^().%\s]+$/;
        // Note: ** was already substituted for ^, but we'll also clean ^ from allowed check
        const cleanExpr = expr.replace(/\*\*/g, '*').replace(/\^/g, '');
        const safeChars = /^[\d+\-*/.()%\s]+$/;
        if (!safeChars.test(cleanExpr)) {
            throw new Error('EquationEvaluator: expression contains disallowed characters');
        }
    }

    /**
     * Safely evaluate a numeric expression using Function constructor.
     * This is safer than eval() because it only allows numeric operations.
     * @param {string} expr - Sanitized expression with ** for exponentiation
     * @returns {number}
     * @throws {Error} If division by zero occurs
     * @private
     */
    _safeEval(expr) {
        // We use the Function constructor instead of eval() for slightly better scoping
        // but we still validate the expression first to ensure it's safe.
        // The expression at this point contains only numbers, operators, parentheses, and whitespace.
        
        // Detect potential division by zero at expression level
        // Pattern: divided by (0 or 0.0) - this is a basic static check
        const divByZeroPattern = /\/\s*\(?\s*0\s*\)?/;
        if (divByZeroPattern.test(expr)) {
            // More thorough: check if division is really by literal zero
            const divParts = expr.split('/');
            for (let i = 1; i < divParts.length; i++) {
                const part = divParts[i].trim();
                // Check if the part starts with 0 or (0) 
                if (/^0[\s)*]/.test(part) || /^0$/.test(part) || /^\(0\)/.test(part)) {
                    throw new Error('Division by zero detected in formula');
                }
            }
        }

        try {
            // Create a function that only has access to Math operations
            const fn = new Function('return (' + expr + ');');
            const result = fn();

            // Post-evaluation: check for infinity (division by zero that wasn't caught statically)
            if (!isFinite(result)) {
                throw new Error('Division by zero detected in formula (result is infinite)');
            }

            return result;
        } catch (e) {
            if (e.message && e.message.includes('Division by zero')) {
                throw e;
            }
            throw new Error('Evaluation failed: ' + e.message);
        }
    }

    /**
     * Convenience method: evaluate with division-by-zero fallback value.
     * @param {string} formula
     * @param {Object} variables
     * @param {number} fallback - Value to return if division by zero occurs (default: Infinity)
     * @returns {number}
     */
    EvaluateWithFallback(formula, variables, fallback = Infinity) {
        try {
            return this.EvaluateFormula(formula, variables);
        } catch (e) {
            if (e.message && e.message.toLowerCase().includes('division by zero')) {
                return fallback;
            }
            throw e; // Re-throw non-division-by-zero errors
        }
    }

    /**
     * Verify that a formula string is syntactically valid.
     * @param {string} formula
     * @returns {boolean}
     */
    IsValidFormula(formula) {
        try {
            this._validateExpression(formula.trim());
            // Try evaluating with empty variables to catch issues
            // This won't work if there are remaining variables, so we use a dummy
            const dummyExpr = formula
                .trim()
                .replace(/[a-zA-Z_]\w*/g, '1');
            this._safeEval(dummyExpr.replace(/\^/g, '**'));
            return true;
        } catch (e) {
            return false;
        }
    }
}

// ---------- DUAL-MODE CONTROLLER CLASS ----------

/**
 * Manages the operating mode of the test engine: Manual mode or Hardware IoT mode.
 * In ManualMode: user enters values directly via UI.
 * In HardwareIoTMode: values are read from Web Serial / LAN / Bluetooth sensors.
 * 
 * When switching modes, the controller appropriately freezes/unfreezes
 * the serial connection streams to prevent port locking and resource leaks.
 */
class DualModeController {
    /**
     * @param {Object} options - Configuration options
     * @param {boolean} options.startInManualMode - If true, start in Manual mode (default: true)
     */
    constructor(options = {}) {
        /** @type {string} Current mode: 'ManualMode' | 'HardwareIoTMode' */
        this._mode = options.startInManualMode !== false ? 'ManualMode' : 'HardwareIoTMode';

        /** @type {boolean} Whether hardware sensors are currently frozen/paused */
        this._frozen = false;

        /** @type {Array<function>} Callbacks for mode change events */
        this._modeChangeCallbacks = [];

        /** @type {Array<function>} Callbacks for freeze/unfreeze events */
        this._freezeCallbacks = [];

        /** @type {Object} Cached sensor values captured at freeze time */
        this._frozenValues = {};

        /** @type {boolean} Internal flag to prevent re-entrancy during mode switching */
        this._switching = false;
    }

    /**
     * Get the current mode.
     * @returns {string} 'ManualMode' or 'HardwareIoTMode'
     */
    get Mode() {
        return this._mode;
    }

    /**
     * Get the frozen state.
     * @returns {boolean}
     */
    get IsFrozen() {
        return this._frozen;
    }

    /**
     * Set the mode to Manual Mode.
     * This will freeze/halt any active hardware sensor streams
     * by calling the serial stop routines.
     * 
     * @returns {boolean} true if mode was changed
     */
    SetManualMode() {
        if (this._switching) return false;
        if (this._mode === 'ManualMode') return true; // Already in manual mode

        this._switching = true;

        try {
            // Freeze hardware sensors before switching to manual
            this._freezeHardware();

            this._mode = 'ManualMode';
            this._frozen = false; // Unfrozen because we're not waiting on hardware

            this._triggerModeChange();
            return true;
        } catch (e) {
            console.error('DualModeController.SetManualMode error:', e);
            return false;
        } finally {
            this._switching = false;
        }
    }

    /**
     * Set the mode to Hardware IoT Mode.
     * This will unfreeze/activate hardware sensor streams.
     * 
     * @returns {boolean} true if mode was changed
     */
    SetHardwareIoTMode() {
        if (this._switching) return false;
        if (this._mode === 'HardwareIoTMode') return true; // Already in hardware mode

        this._switching = true;

        try {
            this._mode = 'HardwareIoTMode';
            this._frozen = false;

            // Unfreeze hardware connections to resume sensor streaming
            this._unfreezeHardware();

            this._triggerModeChange();
            return true;
        } catch (e) {
            console.error('DualModeController.SetHardwareIoTMode error:', e);
            return false;
        } finally {
            this._switching = false;
        }
    }

    /**
     * Toggle between Manual and Hardware IoT modes.
     * @returns {string} The new mode
     */
    ToggleMode() {
        if (this._mode === 'ManualMode') {
            this.SetHardwareIoTMode();
        } else {
            this.SetManualMode();
        }
        return this._mode;
    }

    /**
     * Freeze hardware sensor readings.
     * This pauses the serial stream but keeps the connection open.
     * The last sensor values are cached so the UI can still display them.
     * 
     * @returns {boolean}
     */
    FreezeSensors() {
        if (this._frozen) return true;
        if (this._mode !== 'HardwareIoTMode') {
            console.warn('DualModeController.FreezeSensors: not in HardwareIoT mode');
            return false;
        }

        this._frozen = true;
        this._freezeHardware();
        this._triggerFreeze(true);
        return true;
    }

    /**
     * Unfreeze sensors and resume hardware readings.
     * @returns {boolean}
     */
    UnfreezeSensors() {
        if (!this._frozen) return true;

        this._frozen = false;
        this._unfreezeHardware();
        this._triggerFreeze(false);
        return true;
    }

    /**
     * Check if the controller is in Manual Mode.
     * @returns {boolean}
     */
    IsManualMode() {
        return this._mode === 'ManualMode';
    }

    /**
     * Check if the controller is in Hardware IoT Mode.
     * @returns {boolean}
     */
    IsHardwareIoTMode() {
        return this._mode === 'HardwareIoTMode';
    }

    /**
     * Check if sensors are currently frozen/paused.
     * @returns {boolean}
     */
    IsFrozen() {
        return this._frozen;
    }

    /**
     * Register a callback for mode change events.
     * The callback receives (newMode, oldMode) as parameters.
     * @param {function} callback
     */
    OnModeChange(callback) {
        if (typeof callback === 'function') {
            this._modeChangeCallbacks.push(callback);
        }
    }

    /**
     * Register a callback for freeze/unfreeze events.
     * The callback receives (isFrozen) boolean parameter.
     * @param {function} callback
     */
    OnFreeze(callback) {
        if (typeof callback === 'function') {
            this._freezeCallbacks.push(callback);
        }
    }

    /**
     * Remove a previously registered callback.
     * @param {function} callback
     */
    RemoveCallback(callback) {
        this._modeChangeCallbacks = this._modeChangeCallbacks.filter(function(cb) {
            return cb !== callback;
        });
        this._freezeCallbacks = this._freezeCallbacks.filter(function(cb) {
            return cb !== callback;
        });
    }

    /**
     * Returns the frozen sensor values (captured at freeze time).
     * @returns {Object}
     */
    GetFrozenValues() {
        return Object.assign({}, this._frozenValues);
    }

    /**
     * Trigger all mode change callbacks.
     * @private
     */
    _triggerModeChange() {
        const previousMode = this._mode === 'ManualMode' ? 'HardwareIoTMode' : 'ManualMode';
        for (let i = 0; i < this._modeChangeCallbacks.length; i++) {
            try {
                this._modeChangeCallbacks[i](this._mode, previousMode);
            } catch (e) {
                console.error('DualModeController: mode change callback error:', e);
            }
        }
    }

    /**
     * Trigger all freeze/unfreeze callbacks.
     * @param {boolean} isFrozen
     * @private
     */
    _triggerFreeze(isFrozen) {
        for (let i = 0; i < this._freezeCallbacks.length; i++) {
            try {
                this._freezeCallbacks[i](isFrozen);
            } catch (e) {
                console.error('DualModeController: freeze callback error:', e);
            }
        }
    }

    /**
     * Freeze hardware by caching sensor values and stopping serial streams.
     * This calls the existing serial.js stop mechanisms to release the
     * Web Serial API stream without port locking exceptions.
     * @private
     */
    _freezeHardware() {
        // Cache current sensor values from the live UI if available
        this._cacheSensorValues();

        // Call the existing serial stop routine from serial.js
        // stopSerial() sets serialKeepReading=false and releases reader lock
        if (typeof stopSerial === 'function') {
            try {
                stopSerial();
                console.log('DualModeController: serial stream stopped for freeze');
            } catch (e) {
                console.warn('DualModeController: stopSerial error during freeze:', e);
            }
        }

        // Close LAN WebSocket if active
        if (typeof lanSocket !== 'undefined' && lanSocket && lanSocket.readyState === WebSocket.OPEN) {
            try {
                lanSocket.close();
                console.log('DualModeController: LAN socket closed for freeze');
            } catch (e) {
                console.warn('DualModeController: LAN socket close error:', e);
            }
        }

        // Disconnect Bluetooth if active
        if (typeof btDevice !== 'undefined' && btDevice && btDevice.gatt && btDevice.gatt.connected) {
            try {
                btDevice.gatt.disconnect();
                console.log('DualModeController: Bluetooth disconnected for freeze');
            } catch (e) {
                console.warn('DualModeController: BT disconnect error:', e);
            }
        }
    }

    /**
     * Unfreeze hardware by resuming sensor connections.
     * Note: The user must re-initiate the connection (port select) since
     * Web Serial API requires user gesture for reconnection.
     * @private
     */
    _unfreezeHardware() {
        // We cannot automatically reconnect serial/Bluetooth without user gesture.
        // Instead, we update the UI to prompt the user to reconnect.
        console.log('DualModeController: hardware unfrozen — user must reconnect sensors via UI');

        // Dispatch a custom event that the UI can listen to
        try {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('smartlap:hardware-unfrozen', {
                    detail: { message: 'Hardware sensors unfrozen. Please reconnect sensors via the Connection panel.' }
                }));
            }
        } catch (e) {
            console.warn('DualModeController: dispatchEvent error:', e);
        }
    }

    /**
     * Cache the current sensor display values from the live data UI elements.
     * @private
     */
    _cacheSensorValues() {
        this._frozenValues = {};
        // Try to grab values from common live-data elements
        const sensorMappings = [
            { id: 'val-moisture', key: 'moisture' },
            { id: 'val-force', key: 'force' },
            { id: 'val-avg-force', key: 'avgForce' },
            { id: 'val-dry-density', key: 'dryDensity' },
            { id: 'cbr-val-pen', key: 'penetration' },
            { id: 'cbr-val-load', key: 'cbrLoad' },
            { id: 'slump-val-slump', key: 'slump' },
            { id: 'mat-val-temp', key: 'temperature' },
            { id: 'mat-val-maturity', key: 'maturity' },
            { id: 'mar-val-stab', key: 'stability' },
            { id: 'mar-val-flow', key: 'flow' }
        ];

        for (let i = 0; i < sensorMappings.length; i++) {
            const mapping = sensorMappings[i];
            const el = document.getElementById(mapping.id);
            if (el) {
                const text = el.textContent || '--';
                if (text !== '--' && text !== '') {
                    const num = parseFloat(text);
                    this._frozenValues[mapping.key] = isNaN(num) ? text : num;
                }
            }
        }
    }

    /**
     * Get a summary object describing current controller state.
     * @returns {Object}
     */
    GetStateSummary() {
        return {
            mode: this._mode,
            frozen: this._frozen,
            manualMode: this.IsManualMode(),
            hardwareMode: this.IsHardwareIoTMode(),
            frozenValuesCount: Object.keys(this._frozenValues).length
        };
    }
}

// ---------- GLOBAL INSTANCE ----------

/**
 * Global instance of DualModeController for use throughout the application.
 * Starts in ManualMode by default.
 * @type {DualModeController}
 */
var dynamicModeController = new DualModeController({ startInManualMode: true });

/**
 * Global instance of EquationEvaluator for use throughout the application.
 * @type {EquationEvaluator}
 */
var equationEvaluator = new EquationEvaluator();

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DynamicField: DynamicField,
        EquationEvaluator: EquationEvaluator,
        DualModeController: DualModeController,
        dynamicModeController: dynamicModeController,
        equationEvaluator: equationEvaluator
    };
}

