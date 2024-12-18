import express from "express";
import router from "./router/router";
import sequelize from "./config/db.config";
import { tokenMiddleware } from "./middlewares/token.middleware";


const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(tokenMiddleware)
app.use('/api', router);
app.get('*', (req, res) => { 
    res.status(404).json({ message: 'Not found' });
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

