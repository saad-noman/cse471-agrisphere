cd backend

mkdir data

# needed for Linux kernel versions 6.19 and newer
docker run --name mongodb -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin -e ME_CONFIG_BASICAUTH_USERNAME=user -e ME_CONFIG_BASICAUTH_PASSWORD=pass -e GLIBC_TUNABLES=glibc.pthread.rseq=1 -v $(pwd)/data:/data/db docker.io/mongo:8.0

# for getting docker interactive terminal access
docker exec -it mongodb mongosh -u admin -p admin --authenticationDatabase admin

# For showing all how the data is structured in db
db.getCollectionNames().forEach(function (collectionName) { print(`\n===== ${collectionName} =====`); printjson(db.getCollection(collectionName).findOne());});

# handy git commands (for rebase)
git fetch origin
git stash
git rebase origin/main
git status
nvim edit_file_with_conflicts.txt
git add edit_file_with_conflicts.txt
git rebase --continue
git stash pop
git push --force-with-lease origin akid
