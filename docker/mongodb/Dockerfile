FROM mongo:7.0

# Set environment variables
ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=ewaste_secure_password_2024
ENV MONGO_INITDB_DATABASE=ewaste

# Create volume for data persistence
VOLUME /data/db

# Expose MongoDB port
EXPOSE 27017

# Copy initialization scripts
COPY ./init-mongo.js /docker-entrypoint-initdb.d/

# Use default MongoDB command
CMD ["mongod"]

# sudo docker run -d \
#   -p 27017:27017 \
#   --name ewaste-mongodb \
#   -v mongodb_data:/data/db \
#   -v $(pwd)/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js \
#   -e MONGO_INITDB_ROOT_USERNAME=admin \
#   -e MONGO_INITDB_ROOT_PASSWORD=ewaste_secure_password_2024 \
#   -e MONGO_INITDB_DATABASE=ewaste \
#   mongo:7.0
