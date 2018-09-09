import { EntityManager, getManager, DeleteResult, UpdateResult, InsertResult, SelectQueryBuilder, Repository, DeepPartial } from 'typeorm';

export abstract class BaseRepository<T> {
    private entityName: string;
    private prefix = process.env.DATABASE_PREFIX || 'mango_';
    constructor(entityName?: string) {
        this.entityName = entityName;
    }
    /**
     * Returns repository for the given entity
     * @param entity entity name
     */
    public getRepository(entity?: string | Function | (new () => {})): Repository<T> {
        const man: EntityManager = getManager();
        return this.entityName == null ?
            man.getRepository(this.prefix + entity) : man.getRepository(this.prefix + this.entityName);
    }
    /**
     * Returns repository for the given class
     * @param entityClass entity class
     */
    public getRepoFromClass(entityClass?: Function | (new () => {})): Repository<{}> {
        const man: EntityManager = getManager();
        return man.getRepository(entityClass);
    }
    /**
     * Execute a repository function in asynchronous way
     * @param repositoryFunction a function
     */
    private async executeRepositoryFunction(repositoryFunction: Promise<any>): Promise<any> {
        try {
            return await repositoryFunction;
        } catch (error) {
            throw new Error(error);
        }
    }
    /**
    * Returns a Query builder
    */
    public createQueryBuilder(entity?: string): SelectQueryBuilder<T> {
        return this.getRepository().createQueryBuilder(entity);
    }
    /**
     * Performs a raw SQL Query
     * @param query query string
     * @param parameters parameters
     */
    public async query(query: string, parameters?: any[]): Promise<any> {
        return await this.executeRepositoryFunction(this.getRepository().query(query, parameters));
    }
    /**
     * Preloads an entity from a plain JS object
     * @param object simple JSON object
     */
    public async preload(object): Promise<T> {
        return await this.executeRepositoryFunction(this.getRepository().preload(object));
    }
    /**
     * Creates an instance of <T>
     * @param object Entity
     */
    public async create(object): Promise<{}> {
        return await this.getRepository().create(object);
    }
    /**
     * Inserts a new entity
     * @param object Entity
     */
    public async insert(object): Promise<InsertResult> {
        return await this.getRepository().insert(object);
    }
    /**
     * Merges multiple entities into a single entity
     * @param object Entity
     * @param data Data to be merged
     */
    public async merge(object: T, data: DeepPartial<T>) {
        return await this.getRepository().merge(object, data);
    }
    /**
     * Checks if given entity's primary column is defined
     * @param object Entity
     */
    public hasId(object: T): boolean {
        return this.getRepository().hasId(object);
    }
    /**
     * Returns primary column property values of the given entity
     * @param object Entity
     */
    public getID(object: T): Promise<any> {
        return this.executeRepositoryFunction(this.getRepository().getId(object));
    }
    /**
     * Saves an object in the database
     * @param object Entity
     */
    public save(object): Promise<T> {
        return this.executeRepositoryFunction(this.getRepository().save(object));
    }
    /**
     * Partially updates entity by a given update options or entity id
     * @param object Reference object or ID
     * @param newData update data options
     */
    public update(conditions: any, newData: any): Promise<UpdateResult> {
        return this.executeRepositoryFunction(this.getRepository().update(conditions, newData));
    }
    /**
     * Removes entity from database
     * @param object Entity
     */
    public remove(object: T): Promise<{}> {
        return this.executeRepositoryFunction(this.getRepository().remove(object));
    }
    /**
     * Removes entities by id or given conditions
     * @param conditions conditions to delete
     */
    public delete(conditions: any): Promise<DeleteResult> {
        return this.executeRepositoryFunction(this.getRepository().delete(conditions));
    }
    /**
     * Returns all records for entity
     * @param conditions conditions to look for
     */
    public find(conditions?: any): Promise<T[]> {
        return this.executeRepositoryFunction(this.getRepository().find(conditions));
    }
    /**
     * Count how many records exists for the given conditions
     * @param conditions conditions to count
     */
    public count(conditions: any): Promise<number> {
        return this.executeRepositoryFunction(this.getRepository().count(conditions));
    }
    /**
     * Returns a record that matches an array of conditions
     * @param conditions find options for object
     */
    public findOne(conditions: any): Promise<T> {
        return this.executeRepositoryFunction(this.getRepository().findOne(conditions));
    }
    /**
     * This truncates everything from the table (WARNING)
     */
    public clear(): Promise<void> {
        return this.executeRepositoryFunction(this.getRepository().clear());
    }
}
