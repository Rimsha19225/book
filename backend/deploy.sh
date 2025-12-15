#!/bin/bash

# Deployment script for Physical AI & Humanoid Robotics Textbook backend

set -e  # Exit immediately if a command exits with a non-zero status

# Configuration variables
APP_NAME="physical-ai-textbook-backend"
REPO_URL="https://github.com/your-username/physical-ai-textbook"
DEPLOY_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
LOG_FILE="/var/log/$APP_NAME-deploy.log"
ENV_FILE=".env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
    log "INFO: $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    log "WARNING: $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log "ERROR: $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_status "Running as root"
    else
        print_error "This script must be run as root"
        exit 1
    fi
}

# Backup current deployment
backup_current() {
    print_status "Creating backup of current deployment..."

    if [ -d "$DEPLOY_DIR" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

        mkdir -p "$BACKUP_DIR"
        cp -r "$DEPLOY_DIR" "$BACKUP_PATH"

        print_status "Backup created at $BACKUP_PATH"
    else
        print_warning "No existing deployment to backup"
    fi
}

# Clone or update repository
update_repo() {
    print_status "Updating repository..."

    if [ -d "$DEPLOY_DIR/.git" ]; then
        # Repository exists, pull latest changes
        cd "$DEPLOY_DIR"
        git fetch origin
        git reset --hard origin/main
        print_status "Repository updated to latest commit"
    else
        # First time deployment, clone repository
        mkdir -p "$(dirname $DEPLOY_DIR)"
        git clone "$REPO_URL" "$DEPLOY_DIR"
        cd "$DEPLOY_DIR"
        print_status "Repository cloned"
    fi
}

# Install/update dependencies
install_dependencies() {
    print_status "Installing/updating dependencies..."

    cd "$DEPLOY_DIR/backend"

    # Create or update virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating virtual environment..."
        python3 -m venv venv
    fi

    # Activate virtual environment
    source venv/bin/activate

    # Upgrade pip
    pip install --upgrade pip

    # Install/update dependencies
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        print_status "Dependencies installed/updated"
    else
        print_error "requirements.txt not found"
        exit 1
    fi
}

# Validate environment variables
validate_env() {
    print_status "Validating environment variables..."

    if [ ! -f "$DEPLOY_DIR/backend/$ENV_FILE" ]; then
        print_error "$ENV_FILE not found in backend directory"
        print_warning "Please create $DEPLOY_DIR/backend/$ENV_FILE with required environment variables"
        print_warning "Required variables: DATABASE_URL, OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY"
        exit 1
    fi

    # Check if required variables are set
    source "$DEPLOY_DIR/backend/$ENV_FILE"

    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL is not set in $ENV_FILE"
        exit 1
    fi

    if [ -z "$OPENAI_API_KEY" ]; then
        print_error "OPENAI_API_KEY is not set in $ENV_FILE"
        exit 1
    fi

    print_status "Environment variables validated"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."

    cd "$DEPLOY_DIR/backend"
    source venv/bin/activate

    # Source environment variables
    export $(grep -v '^#' "$ENV_FILE" | xargs)

    # Run database initialization
    python -c "
import sys
import os
sys.path.append('src')
from database.migrations.init_db import init_db
init_db()
"

    print_status "Database migrations completed"
}

# Restart services
restart_services() {
    print_status "Restarting services..."

    # If using systemd, restart the service
    if systemctl is-active --quiet "$APP_NAME"; then
        systemctl restart "$APP_NAME"
        print_status "Service $APP_NAME restarted"
    else
        print_warning "Systemd service $APP_NAME not found or not active"
        print_status "Starting application directly..."

        cd "$DEPLOY_DIR/backend"
        source venv/bin/activate

        # Source environment variables
        export $(grep -v '^#' "$ENV_FILE" | xargs)

        # Start the application in the background
        nohup uvicorn src.api.main:app --host 0.0.0.0 --port 8000 > /var/log/$APP_NAME.log 2>&1 &
        echo $! > /var/run/$APP_NAME.pid

        print_status "Application started in background with PID $(cat /var/run/$APP_NAME.pid)"
    fi
}

# Health check
health_check() {
    print_status "Performing health check..."

    sleep 5  # Wait a bit for the service to start

    # Check if the service is responding
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_status "Health check passed - service is responding"
    else
        print_error "Health check failed - service may not be running properly"
        # Don't exit here, just report the issue
    fi
}

# Main deployment function
main() {
    print_status "Starting deployment of $APP_NAME..."

    check_root
    backup_current
    update_repo
    install_dependencies
    validate_env
    run_migrations
    restart_services
    health_check

    print_status "Deployment completed successfully!"
    print_status "Application is now running at http://localhost:8000"
}

# Rollback function
rollback() {
    print_warning "Rolling back to previous version..."

    # Find the most recent backup
    LATEST_BACKUP=$(ls -td "$BACKUP_DIR"/backup_* 2>/dev/null | head -n1)

    if [ -n "$LATEST_BACKUP" ]; then
        print_status "Restoring from backup: $LATEST_BACKUP"
        rm -rf "$DEPLOY_DIR"
        cp -r "$LATEST_BACKUP" "$DEPLOY_DIR"

        # Restart services after rollback
        restart_services

        print_status "Rollback completed"
    else
        print_error "No backups found to rollback to"
        exit 1
    fi
}

# Parse command line arguments
case "$1" in
    rollback)
        rollback
        ;;
    *)
        main
        ;;
esac