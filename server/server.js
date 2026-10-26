const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

connectDB();
require('./src/cron/dailyReport');

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
