# Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the Link Hub Management System to various environments.

## Architecture Diagram

```
                    ┌─────────────────────────────────┐
                    │   User / Client Browser          │
                    └──────────────┬──────────────────┘
                                   │ HTTP/HTTPS
                    ┌──────────────▼──────────────────┐
                    │    Nginx Reverse Proxy           │
                    │  (Port 80/443)                   │
                    └──────────────┬──────────────────┘
                    ┌──────────────┴──────────────────┐
                    │                                 │
        ┌───────────▼──────────┐        ┌────────────▼───────┐
        │  Frontend Service    │        │ Backend API Service │
        │  React.js (3000)     │        │ Express.js (5000)   │
        │  ┌────────────────┐  │        │ ┌────────────────┐  │
        │  │ Components     │  │        │ │ Routes         │  │
        │  │ Pages          │  │        │ │ Controllers    │  │
        │  │ Services       │  │        │ │ Models         │  │
        │  └────────────────┘  │        │ │ Middleware     │  │
        └─────────┬────────────┘        └────────────┬────────┘
                  │                                  │
                  └──────────────┬───────────────────┘
                                 │ MongoDB Protocol
                    ┌────────────▼──────────────────┐
                    │  MongoDB Database (27017)     │
                    │  ┌──────────────────────────┐ │
                    │  │ users collection         │ │
                    │  │ links collection         │ │
                    │  │ rules collection         │ │
                    │  │ analytics collection     │ │
                    │  └──────────────────────────┘ │
                    └───────────────────────────────┘
```

## Local Development Deployment

### Prerequisites
- Node.js v16+ and npm
- MongoDB v4.4+
- Docker and Docker Compose (optional)
- Git

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26.git
cd Advitiya-x-JPD-Hub-Hackathon-26

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# nano .env

# Start services
docker-compose up --build

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

#### Database Setup
```bash
# MongoDB should be running
# Connection: mongodb://localhost:27017/linkhub
```

## Production Deployment

### Server Requirements
- Linux server (Ubuntu 20.04+ or similar)
- 2+ CPU cores
- 4GB+ RAM
- 20GB+ storage
- Docker and Docker Compose installed
- SSL/TLS certificate for HTTPS

### Environment Setup

1. **SSH into your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Docker and Docker Compose**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Clone and prepare application**
   ```bash
   git clone https://github.com/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26.git
   cd Advitiya-x-JPD-Hub-Hackathon-26
   
   # Create production environment file
   cp .env.example .env
   nano .env  # Edit with production values
   ```

4. **Production Environment Variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb://root:secure-password@mongodb:27017/linkhub?authSource=admin
   JWT_SECRET=your-very-secure-random-key-change-this
   CORS_ORIGIN=https://yourdomain.com
   REACT_APP_API_URL=https://yourdomain.com/api
   ```

5. **Setup SSL Certificates (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot certonly --standalone -d yourdomain.com
   ```

6. **Update nginx.conf**
   Configure the nginx.conf file with your domain and SSL certificates

7. **Start services**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

### Deployment Checklist

- [ ] Server security configured (firewall, SSH keys)
- [ ] Domain name pointed to server IP
- [ ] SSL certificate installed and configured
- [ ] Environment variables set correctly
- [ ] MongoDB backup strategy in place
- [ ] Monitoring and logging enabled
- [ ] Database backups automated
- [ ] Health checks configured
- [ ] CI/CD pipeline setup (optional)

## Monitoring and Maintenance

### Health Checks
```bash
# Check all services
curl http://localhost:5000/api/health

# Check Docker containers
docker-compose ps

# View logs
docker-compose logs -f
```

### Backup and Recovery

#### MongoDB Backup
```bash
# Create backup
docker-compose exec mongodb mongodump --out /backup

# Restore from backup
docker-compose exec mongodb mongorestore /backup
```

#### Full System Backup
```bash
# Backup everything
tar -czf backup-$(date +%Y%m%d).tar.gz .
```

### Performance Optimization

1. **Database Indexing**
   - Ensure MongoDB indexes are created
   - Monitor slow queries

2. **Caching Strategy**
   - Implement Redis for session caching
   - Use browser caching for static assets

3. **Load Balancing**
   - Use Nginx for load distribution
   - Scale backend replicas if needed

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild containers
docker-compose down
docker-compose up --build
```

### MongoDB Connection Failed
```bash
# Check MongoDB status
docker-compose logs mongodb

# Verify credentials
# Check MONGODB_URI in .env
```

### Frontend Not Communicating with Backend
- Verify backend is running: `docker-compose ps`
- Check REACT_APP_API_URL in .env
- Verify CORS settings in backend
- Check network connectivity: `docker network ls`

### Out of Disk Space
```bash
# Clean Docker resources
docker system prune -a

# Remove old images
docker image prune -a
```

## CI/CD Integration (Optional)

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and Deploy
        run: |
          docker-compose build
          docker-compose push
          # Add deployment commands
```

## Scaling Considerations

### Horizontal Scaling
- Use Kubernetes for container orchestration
- Load balance multiple backend instances
- Use managed MongoDB Atlas for database

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Implement caching strategies

## Security Best Practices

1. **API Security**
   - Use HTTPS/TLS for all communications
   - Implement rate limiting
   - Validate all inputs
   - Use CORS appropriately

2. **Database Security**
   - Use strong authentication credentials
   - Enable encryption at rest
   - Regular security updates
   - Database access restrictions

3. **Infrastructure Security**
   - Firewall configuration
   - SSH key management
   - Regular security patches
   - Monitoring and alerting

## Support and Issues

For deployment issues or questions:
- Check GitHub Issues: https://github.com/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26/issues
- Contact the development team
- Review logs for error details
