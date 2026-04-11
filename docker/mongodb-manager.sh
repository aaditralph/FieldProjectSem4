#!/bin/bash

# MongoDB Docker Management Script for E-Waste App

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${GREEN}🗄️  E-Waste MongoDB Docker Manager${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo "1. Start MongoDB"
    echo "2. Start MongoDB with Mongo Express (Web UI)"
    echo "3. Stop MongoDB"
    echo "4. Restart MongoDB"
    echo "5. View Logs"
    echo "6. Connect to MongoDB Shell"
    echo "7. Database Status"
    echo "8. Reset Database (⚠️  Deletes all data)"
    echo "9. Backup Database"
    echo "0. Exit"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
}

# Start MongoDB
start_mongodb() {
    print_info "Starting MongoDB..."
    docker-compose up -d mongodb
    
    print_info "Waiting for MongoDB to be ready..."
    sleep 5
    
    if docker-compose ps mongodb | grep -q "Up"; then
        print_success "MongoDB is running!"
        print_info "Connection String: mongodb://ewaste_user:ewaste_password_2024@localhost:27017/ewaste"
    else
        print_error "Failed to start MongoDB. Check logs with: docker-compose logs mongodb"
    fi
}

# Start with Mongo Express
start_with_express() {
    print_info "Starting MongoDB with Mongo Express..."
    docker-compose --profile tools up -d
    
    print_info "Waiting for services to be ready..."
    sleep 10
    
    print_success "MongoDB is running!"
    print_success "Mongo Express available at: http://localhost:8081"
    print_info "MongoDB Connection String: mongodb://ewaste_user:ewaste_password_2024@localhost:27017/ewaste"
}

# Stop MongoDB
stop_mongodb() {
    print_info "Stopping MongoDB..."
    docker-compose down
    print_success "MongoDB stopped!"
}

# Restart MongoDB
restart_mongodb() {
    print_info "Restarting MongoDB..."
    docker-compose restart mongodb
    print_success "MongoDB restarted!"
}

# View Logs
view_logs() {
    print_info "Showing MongoDB logs (Ctrl+C to exit)..."
    docker-compose logs -f mongodb
}

# Connect to MongoDB Shell
connect_shell() {
    print_info "Connecting to MongoDB shell..."
    docker exec -it ewaste-mongodb mongosh -u ewaste_user -p ewaste_password_2024 ewaste
}

# Check Status
check_status() {
    print_info "MongoDB Container Status:"
    docker-compose ps mongodb
    
    echo ""
    print_info "Database Collections:"
    docker exec -it ewaste-mongodb mongosh -u ewaste_user -p ewaste_password_2024 ewaste --quiet --eval "
        const collections = db.getCollectionNames();
        print('📦 Collections: ' + collections.join(', '));
        collections.forEach(col => {
            const count = db[col].countDocuments();
            print('  - ' + col + ': ' + count + ' documents');
        });
    "
}

# Reset Database
reset_database() {
    print_warning "⚠️  This will delete ALL data in MongoDB!"
    read -p "Are you sure? (y/N): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        print_info "Stopping and removing MongoDB..."
        docker-compose down -v
        print_info "Starting fresh MongoDB..."
        docker-compose up -d mongodb
        sleep 5
        print_success "Database has been reset!"
    else
        print_info "Operation cancelled."
    fi
}

# Backup Database
backup_database() {
    BACKUP_DIR="./backup/$(date +%Y%m%d_%H%M%S)"
    print_info "Creating backup in $BACKUP_DIR..."
    
    mkdir -p $BACKUP_DIR
    
    docker exec ewaste-mongodb mongodump \
        --out /data/backup \
        --authenticationDatabase admin \
        -u admin \
        -p ewaste_secure_password_2024
    
    docker cp ewaste-mongodb:/data/backup $BACKUP_DIR
    
    print_success "Backup created successfully in $BACKUP_DIR"
}

# Main loop
while true; do
    show_menu
    read -p "Select an option [0-9]: " choice
    case $choice in
        1) start_mongodb ;;
        2) start_with_express ;;
        3) stop_mongodb ;;
        4) restart_mongodb ;;
        5) view_logs ;;
        6) connect_shell ;;
        7) check_status ;;
        8) reset_database ;;
        9) backup_database ;;
        0) print_info "Goodbye!"; exit 0 ;;
        *) print_error "Invalid option. Please try again." ;;
    esac
    echo ""
    read -p "Press Enter to continue..."
done
