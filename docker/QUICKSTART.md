# 🚀 Quick Start - MongoDB Docker

## Option 1: Interactive Menu (Easiest)

```bash
cd docker
./mongodb-manager.sh
```

This will show you an interactive menu with all options!

## Option 2: Manual Commands

### Start MongoDB

```bash
cd docker
docker-compose up -d mongodb
```

### Start with Web UI (Mongo Express)

```bash
cd docker
docker-compose --profile tools up -d
```

Then visit: http://localhost:8081

### Check if Running

```bash
docker-compose ps
```

### View Logs

```bash
docker-compose logs -f mongodb
```

### Stop MongoDB

```bash
docker-compose down
```

## 🔗 Connect to Database

### Connection String

```
mongodb://ewaste_user:ewaste_password_2024@localhost:27017/ewaste
```

### Update Backend .env

Create `backend/.env` file:

```env
MONGODB_URI=mongodb://ewaste_user:ewaste_password_2024@localhost:27017/ewaste
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

## 🧪 Test Connection

```bash
# Connect to MongoDB shell
docker exec -it ewaste-mongodb mongosh -u ewaste_user -p ewaste_password_2024 ewaste

# Run a test query
db.users.find()
```

## 📊 Database Structure

The following collections are automatically created:

- ✅ `users` - User accounts with validation
- ✅ `requests` - E-waste pickup requests
- ✅ `drives` - Community drives
- ✅ `pickups` - Pickup records
- ✅ `transactions` - Payment records
- ✅ `pricing_configs` - Pricing configuration
- ✅ `audit_logs` - Audit trail

## 🎯 Next Steps

1. Start MongoDB: `docker-compose up -d mongodb`
2. Update `backend/.env` with the connection string
3. Start your backend: `cd backend && npm start`
4. Run seed script (optional): `cd backend && npm run seed`

## 🆘 Troubleshooting

**Port already in use:**
```bash
# Check what's using port 27017
lsof -i :27017

# Or change the port in docker-compose.yml
ports:
  - "27018:27017"  # Use 27018 instead
```

**Container won't start:**
```bash
# View logs
docker-compose logs mongodb

# Reset completely
docker-compose down -v
docker-compose up -d mongodb
```

**Can't connect:**
```bash
# Wait 10-15 seconds after starting (MongoDB needs time to initialize)
docker-compose logs -f mongodb
```
