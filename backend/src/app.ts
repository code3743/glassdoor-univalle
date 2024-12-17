import express from "express";
import router from "./router/router";
import { Student } from "./models";
import sequelize from "./config/db.config";


const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use('/api', router);


const main = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

main();

