cd backend

mkdir data

# needed for Linux kernel versions 6.19 and newer
docker run --name mongodb -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin -e ME_CONFIG_BASICAUTH_USERNAME=user -e ME_CONFIG_BASICAUTH_PASSWORD=pass -e GLIBC_TUNABLES=glibc.pthread.rseq=1 -v $(pwd)/data:/data/db docker.io/mongo:8.0

# for getting docker interactive terminal access
docker exec -it mongodb mongosh -u admin -p admin --authenticationDatabase admin
