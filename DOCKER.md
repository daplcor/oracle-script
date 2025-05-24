# Build
docker build -t kadena-oracle .

# Run with env file
docker run --env-file .env -d --name oracle-kda-usd kadena-oracle

# Or with individual env vars
docker run -e REPORTER_ID=reporter1 -e SYMBOL=KDA/USD -e PUBLIC_KEY=... kadena-oracle