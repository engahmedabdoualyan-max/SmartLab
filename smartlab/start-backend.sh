#!/bin/bash
# SmartLab Backend Server Manager
# This script manages the Flask backend server for the SmartLab hybrid project

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR"

# Function to check if a port is in use
port_in_use() {
    netstat -tuln 2>/dev/null | grep -q ":$1 "
    return $?
}

# Function to start the backend server
start_backend() {
    echo "================================================================================"
    echo "Starting SmartLab Hybrid Backend"
    echo "================================================================================"
    echo "Backend Directory: $BACKEND_DIR"
    echo "Python Virtual Environment: $BACKEND_DIR/venv"
    echo "Port: 5000"
    echo "Original Static Site: /home/dr-ahmed/Documents/newprojectsl/"
    echo "Design Integrity: 100% preserved"
    echo "================================================================================"
    
    if [ ! -d "$BACKEND_DIR/venv" ]; then
        echo "ERROR: Virtual environment not found at $BACKEND_DIR/venv"
        echo "Please run: cd $BACKEND_DIR && python3 -m venv venv"
        exit 1
    fi
    
    # Activate virtual environment
    source "$BACKEND_DIR/venv/bin/activate"
    
    # Check if required packages are installed
    if ! python3 -c "import flask" 2>/dev/null; then
        echo "ERROR: Flask not installed"
        echo "Running: pip3 install -r requirements.txt"
        pip3 install -r requirements.txt
    fi
    
    # Check if port 5000 is available
    if port_in_use 5000; then
        echo "WARNING: Port 5000 is already in use"
        echo "The backend may already be running."
        echo "If not, please stop the existing process and try again."
    fi
    
    # Start the backend server
    echo "Starting Flask backend server..."
    echo "Access the original static site at: http://localhost:8190"
    echo "Access backend APIs at: http://localhost:5000/api/"
    echo "Backend health check: http://localhost:5000/api/health"
    echo "================================================================================"
    echo "Backend server is running... Press Ctrl+C to stop"
    echo "================================================================================"
    
    # Run the Flask application
    cd "$BACKEND_DIR"
    python3 main.py
}

# Function to stop the backend server
stop_backend() {
    echo "================================================================================"
    echo "Stopping SmartLab Hybrid Backend"
    echo "================================================================================"
    
    source "$BACKEND_DIR/venv/bin/activate"
    
    # Find and kill processes running on port 5000
    PIDS=$(lsof -ti:5000 2>/dev/null)
    
    if [ -n "$PIDS" ]; then
        echo "Stopping processes on port 5000: $PIDS"
        kill $PIDS 2>/dev/null
        sleep 2
        
        # Force kill if still running
        if lsof -ti:5000 >/dev/null 2>&1; then
            echo "Force killing processes..."
            kill -9 $PIDS 2>/dev/null
        fi
    else
        echo "No processes found running on port 5000"
    fi
    
    # Clean up temporary files
    echo "Cleaning up temporary files..."
    rm -rf "$BACKEND_DIR/uploads" "$BACKEND_DIR/temp" 2>/dev/null
    
    echo "================================================================================"
    echo "Backend server stopped"
    echo "================================================================================"
}

# Function to show status
status_backend() {
    echo "================================================================================"
    echo "SmartLab Hybrid Backend Status"
    echo "================================================================================"
    
    if [ -d "$BACKEND_DIR/venv" ]; then
        echo "✓ Virtual environment exists: $BACKEND_DIR/venv"
        source "$BACKEND_DIR/venv/bin/activate"
        
        # Check Flask version
        if python3 -c "import flask; print('Flask version: ' + flask.__version__)" 2>/dev/null; then
            echo "✓ Flask is installed and working"
        else
            echo "✗ Flask is not installed properly"
        fi
        
        # Check for required packages
        for package in flask flask_cors qrcode reportlab; do
            if python3 -c "import $package" 2>/dev/null; then
                echo "✓ Package '$package' is installed"
            else
                echo "✗ Package '$package' is missing"
            fi
        done
        
        # Check if backend is running
        if port_in_use 5000; then
            echo "✓ Backend server is running on port 5000"
            echo "  Services available at: http://localhost:5000/api/"
        else
            echo "✗ Backend server is NOT running on port 5000"
        fi
        
        # Check temporary files
        if [ -d "$BACKEND_DIR/uploads" ]; then
            UPLOAD_COUNT=$(ls "$BACKEND_DIR/uploads" 2>/dev/null | wc -l)
            echo "✓ Uploads directory exists ($UPLOAD_COUNT files)"
        else
            echo "⚠ Uploads directory does not exist"
        fi
        
        if [ -d "$BACKEND_DIR/temp" ]; then
            TEMP_COUNT=$(ls "$BACKEND_DIR/temp" 2>/dev/null | wc -l)
            echo "✓ Temp directory exists ($TEMP_COUNT files)"
        else
            echo "⚠ Temp directory does not exist"
        fi
    else
        echo "✗ Virtual environment not found: $BACKEND_DIR/venv"
    fi
    
    echo "================================================================================"
    echo "Original static site available at: http://localhost:8190"
    echo "Backend API endpoint: http://localhost:5000/api/health"
    echo "================================================================================"
}

# Function to show help
cmd_help() {
    echo "================================================================================"
    echo "SmartLab Backend Server Manager"
    echo "================================================================================"
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  start    Start the backend server"
    echo "  stop     Stop the backend server"
    echo "  restart  Restart the backend server"
    echo "  status   Show server status"
    echo "  help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 stop"
    echo "  $0 status"
    echo ""
    echo "The backend will serve the original static site with enhanced API services"
    echo "while preserving 100% of the original design and functionality."
    echo "================================================================================"
}

# Main script logic
case "$1" in
    start)
        start_backend
        ;;
    stop)
        stop_backend
        ;;
    restart)
        stop_backend
        sleep 2
        start_backend
        ;;
    status)
        status_backend
        ;;
    help|--help|-h)
        cmd_help
        ;;
    *)
        echo "Unknown command: $1"
        echo ""
        cmd_help
        exit 1
        ;;
esac
