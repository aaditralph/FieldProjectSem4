# 🔧 MongoDB Setup Guide

## Current Status

✅ **Frontend**: Configured for production (EXPO_PUBLIC_USE_MOCK=false)  
✅ **Backend**: Running on port 5000  
❌ **MongoDB**: Not running - needs setup  

## 🎯 Choose Your MongoDB Setup

### Option 1: MongoDB Atlas (Recommended for Production) ⭐

This is the **easiest and best option** for your project.

#### Steps:

1. **Create Free Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free tier (512MB - enough for development)

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier (Shared)
   - Select a region close to you
   - Click "Create"

3. **Setup Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Username: `ewaste_user`
   - Password: Choose a strong password
   - Role: "Read and write to any database"
   - Click "Add User"

4. **Setup Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://ewaste_user:<password>@cluster0.xxxxx.mongodb.net/`

6. **Update Backend .env**
   
   Edit `/home/infirio/Documents/ewaste/backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://ewaste_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ewaste?retryWrites=true&w=majority
   ```

7. **Restart Backend**
   ```bash
   cd /home/infirio/Documents/ewaste/backend
   npm start
   ```

8. **You should see**: ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net

---

### Option 2: Install MongoDB Locally

If you prefer running MongoDB on your machine:

#### Ubuntu/Debian:

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

Then update backend `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/ewaste
```

---

### Option 3: Fix Docker Permissions

If you want to use the Docker setup I created:

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Apply group changes (logout and login again, or run:)
newgrp docker

# Then start MongoDB
cd /home/infirio/Documents/ewaste/docker
docker compose up -d mongodb

# Check if running
docker compose ps
```

Update backend `.env`:
```env
MONGODB_URI=mongodb://ewaste_user:ewaste_password_2024@localhost:27017/ewaste
```

---

## ✅ Verify MongoDB Connection

After setting up MongoDB, restart the backend:

```bash
cd /home/infirio/Documents/ewaste/backend
npm start
```

**Success output should show:**
```
🚀 Server running on port 5000
📡 API URL: http://localhost:5000/api
✅ MongoDB Connected: <your-mongodb-host>
```

**Test the API:**
```bash
curl http://localhost:5000/api/health
```

---

## 🎯 Quick Test with Frontend

Once MongoDB is connected:

1. **Backend running**: ✅ Port 5000
2. **Frontend running**: ✅ Expo (already configured for production)
3. **Test login**:
   - Phone: `9876543210` (Citizen)
   - OTP: `1234`

---

## 📊 Seed the Database (Optional)

Once MongoDB is connected, you can add sample data:

```bash
cd /home/infirio/Documents/ewaste/backend
node scripts/seed.js
```

This will create:
- Test users (Citizen, Vendor, Admin)
- Sample requests
- Community drives
- Pricing configurations

---

## 🆘 Troubleshooting

### "MongoDB Connection Error"
- Check if MongoDB is running
- Verify connection string in `.env`
- Check network/firewall settings
- For Atlas: Ensure IP whitelist includes your IP

### "Authentication Failed"
- Verify username and password in connection string
- For Atlas: Check database user credentials
- Special characters in password need URL encoding

### "Database not found"
- MongoDB creates database on first write
- Run the seed script or create your first user via the app

---

## 🌐 Production Deployment

When ready for production:

1. **Deploy Backend**: Render.com or Railway.app
2. **Use MongoDB Atlas**: Cloud database
3. **Update Frontend .env**:
   ```env
   EXPO_PUBLIC_API_URL=https://your-backend.onrender.com/api
   EXPO_PUBLIC_USE_MOCK=false
   ```

See: `/home/infirio/Documents/ewaste/SETUP.md` for deployment guides.
