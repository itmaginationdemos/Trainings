import {Module, Provider} from "@nestjs/common";
import {Sequelize} from "sequelize-typescript";
import {File} from "./entity/file";
import {FileDbService} from "./services/file-db.service";


const MODELS = [
    File,
];
const VALUE_PROVIDERS: Provider[] = [
    {
        provide: 'DB_REPOSITORY-FILE',
        useValue: File,
    }
];
const SERVICE_PROVIDERS: Provider[] = [
    FileDbService,
];
const SEQUELIZE_PROVIDER: Provider[] = [
    {
        provide: 'SEQUELIZE',
        useFactory: async () => {
            const sequelize = (process.env.node_env === 'test') ? new Sequelize('sqlite::memory:') : new Sequelize({
                dialect: 'mysql',
                host: 'localhost',
                port: 3306,
                username: 'root',
                password: 'example',
                database: 'szkolenie',
                logging: false,
            });

            sequelize.addModels(MODELS);

            if (process.env.node_env === 'test') {
                await sequelize.sync({force: true});
            }

            return sequelize;
        },
    },
];

@Module({
    imports: [],
    controllers: [],
    providers: [
        ...VALUE_PROVIDERS,
        ...SERVICE_PROVIDERS,
        ...SEQUELIZE_PROVIDER,
    ],
    exports: [
        ...VALUE_PROVIDERS,
        ...SERVICE_PROVIDERS,
        ...SEQUELIZE_PROVIDER,
    ],
})
export class DbModule {}
