# MongoDB Docker Configuration

This directory contains Docker configuration for running MongoDB locally for development.

## 📁 Files

- `mongodb/Dockerfile` - MongoDB container configuration
- `mongodb/init-mongo.js` - Database initialization script
- `docker-compose.yml` - Multi-container orchestration

## 🚀 Quick Start

### Start MongoDB

```bash
# Navigate to docker directory
cd docker

# Start MongoDB container
docker-compose up -d mongodb

# Check if it's running
docker-compose ps

# View logs
docker-compose logs -f mongodb
```

### Start with Mongo Express (Web UI)

```bash
# Start both MongoDB and Mongo Express
docker-compose --profile tools up -d

# Access Mongo Express at http://localhost:8081
```

### Stop MongoDB

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (⚠️ deletes all data)
docker-compose down -v
```

## 🔑 Database Credentials

### Root Admin
- **Username**: `admin`
- **Password**: `ewaste_secure_password_2024`
- **Database**: `admin`

### Application User
- **Username**: `ewaste_user`
- **Password**: `ewaste_password_2024`
- **Database**: `ewaste`

## 🔗 Connection Strings

### Local Development
```
mongodb://ewaste_user:ewaste_password_2024@localhost:27017/ewaste
```

### With Admin Access
```
mongodb://admin:ewaste_secure_password_2024@localhost:27017/ewaste?authSource=admin
```

### For Backend .env
```env
MONGODB_URI=mongodb://ewaste_user:ewaste_password_2024@localhost:27017/ewaste
```

## 📊 Database Structure

The initialization script creates the following collections:

- `users` - User accounts (Citizens, Vendors, Admins)
- `requests` - E-waste pickup requests
- `drives` - Community e-waste drives
- `pickups` - Pickup records with OTP verification
- `transactions` - Payment transactions
- `pricing_configs` - Pricing configuration by category
- `audit_logs` - Audit trail for all operations

## 🛠️ Useful Commands

### Connect to MongoDB Shell

```bash
# Using admin user
docker exec -it ewaste-mongodb mongosh -u admin -p ewaste_secure_password_2024 --authenticationDatabase admin

# Using app user
docker exec -it ewaste-mongodb mongosh -u ewaste_user -p ewaste_password_2024 ewaste
```

### Backup Database

```bash
docker exec ewaste-mongodb mongodump --out /data/backup --authenticationDatabase admin -u admin -p ewaste_secure_password_2024
docker cp ewaste-mongodb:/data/backup ./backup
```

### Restore Database

```bash
docker cp ./backup ewaste-mongodb:/data/backup
docker exec ewaste-mongodb mongorestore /data/backup --authenticationDatabase admin -u admin -p ewaste_secure_password_2024
```

### View Database Stats

```bash
docker exec -it ewaste-mongodb mongosh -u ewaste_user -p ewaste_password_2024 ewaste --eval "db.stats()"
```

## ⚙️ Configuration

### Change Default Passwords

Edit these environment variables in `docker-compose.yml`:

```yaml
environment:
  MONGO_INITDB_ROOT_USERNAME: your_admin_username
  MONGO_INITDB_ROOT_PASSWORD: your_secure_password
```

And update `init-mongo.js`:

```javascript
db.createUser({
  user: 'your_app_username',
  pwd: 'your_secure_password',
  roles: [...]
});
```

### Persistent Data

Data is stored in a Docker volume `mongodb_data` and persists across container restarts.

To view volume information:
```bash
docker volume ls | grep ewaste
docker volume inspect ewaste_mongodb_data
```

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs mongodb

# Remove container and restart
docker-compose down
docker-compose up -d mongodb
```

### Connection refused

```bash
# Check if MongoDB is healthy
docker-compose ps

# Wait for health check to pass (takes ~30 seconds on first start)
docker-compose logs -f mongodb
```

### Reset Database

```bash
# Stop and remove everything
docker-compose down -v

# Start fresh
docker-compose up -d mongodb
```

## 🔒 Security Notes

⚠️ **For Production Use:**

1. Change all default passwords
2. Don't expose port 27017 publicly
3. Use Docker secrets for credentials
4. Enable TLS/SSL connections
5. Regularly backup your data
6. Keep MongoDB image updated

## 📚 Additional Resources

- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongo Express GitHub](https://github.com/mongo-express/mongo-express)
