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

BASIC WORKFLOW
==================================

1. CONTROLLER
backend/controllers/demoController.js (Defines what the API returns)
res.json({ name: req.user.name });

2. ROUTE
backend/routes/demoRoutes.js (Connects URL to controller.)
router.get('/', protect, getDemo);

3. SERVER
backend/server.js (Registers the route)
app.use('/api/demo', demoRoutes);

4. TEST BACKEND
GET:
http://localhost:5000/api/demo (Make sure the API works before touching frontend, do curl command test and all)

5. FRONTEND SERVICE
frontend/src/services/demoService.js (Calls the API)
api.get('/demo');

6. VUE PAGE
frontend/src/pages/SimpleDemo.vue (Creates UI + calls service)
const response = await getDemo();
name.value = response.data.name;

<button @click="loadUser">Get My Name</button>
<p>Hello, {{ name }}!</p>

7. ROUTER
frontend/src/router/index.js (Connects URL to page)
/simple-demo -> SimpleDemo.vue
