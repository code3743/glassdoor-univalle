import express from "express";
import router from "./router/router";
import sequelize from "./config/db.config";
import { tokenMiddleware } from "./middlewares/token.middleware";
import cors from "cors";


const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(tokenMiddleware)
app.use('/api', router);
app.use(cors())
app.get('*', (req, res) => { 
    res.status(200).send('Welcome to the API');
});


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

