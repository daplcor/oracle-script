# Docker Usage

**Download deployment files - compose method:**
   ```bash
   wget https://raw.githubusercontent.com/daplco/oracle-script/main/docker-compose.yml
   wget https://raw.githubusercontent.com/daplco/oracle-script/main/.env.example
   wget https://raw.githubusercontent.com/daplco/oracle-script/main/deploy.sh
   chmod +x deploy.sh
   ```

Configure environment variables

cp .env.example .env
# Edit .env with your settings
nano .env

# Deploy
./deploy.sh

## If you want to build from the repo see below

# Build
docker build -t kadena-oracle .

# Run with env file
docker run --env-file .env -d --name oracle-kda-usd kadena-oracle

# Or with individual env vars
docker run -e REPORTER_ID=reporter1 -e SYMBOL=KDA/USD -e PUBLIC_KEY=... kadena-oracle