import { EntityManager, getManager, Repository, DeleteResult, UpdateResult } from 'typeorm';

export abstract class BaseRepository<T> {
    private entityName: string;
    constructor(entityName: string) {
        this.entityName = entityName;
    }
    /**
     * Return repository for the entity given
     */
    protected getRepository(): Repository<{}> {
        const man: EntityManager = getManager();
        return man.getRepository(this.entityName);
    }
    /**
     * Executes Asynchronous a function
     * @param repositoryFunction a function
     */
    public async executeRepositoryFunction(repositoryFunction: Promise<any>): Promise<any> {
        try {
            return await repositoryFunction;
        } catch (error) {
            throw error;
        }
    }
    /**
    * Returns a Query builder
    */
    public getQueryBuilder(entity?: string) {
        return this.getRepository().createQueryBuilder(entity);
    }
    /**
     * Checks if given entity's primary column is defined
     * @param object Entity
     */
    public async hasID(object: T): Promise<boolean> {
        return await this.getRepository().hasId(object);
    }
    /**
     * Returns primary column property values of the given entity
     * @param object Entity
     */
    public async getID(object: T): Promise<any> {
        return await this.executeRepositoryFunction(this.getRepository().getId(object));
    }
    /**
     * Performs a raw SQL Query
     * @param query query string
     * @param parameters parameters
     */
    public async performRawQuery(query: string, parameters?: any[]) {
        return await this.getRepository().query(query, parameters);
    }
    /**
     * Preloads an entity from a plain JS object
     * @param object simple JSON object
     */
    public async preload(object: T): Promise<T> {
        return await this.executeRepositoryFunction(this.getRepository().preload(object));
    }
    /**
     * Creates an instance of <T>
     * @param object Entity
     */
    public async create(object: T) {
        return await this.getRepository().create(object);
    }
    /**
     * Inserts a new entity
     * @param object Entity
     */
    public async insert(object: T) {
        return await this.getRepository().insert(object);
    }
    /**
     * Merges multiple entities into a single entity
     * @param object Entity
     * @param data Data to be merged
     */
    public async merge(object, ...data: any[]) {
        return await this.getRepository().merge(object, data);
    }
    /**
     * Saves an object in the database
     * @param object Entity
     */
    public async save(object: T): Promise<T> {
        return await this.executeRepositoryFunction(this.getRepository().save(object));
    }
    /**
     * Partially updates entity by a given update options or entity id
     * @param object Reference object or ID
     * @param newData update data options
     */
    public async update(conditions: any, newData: any): Promise<UpdateResult> {
        return await this.executeRepositoryFunction(this.getRepository().update(conditions, newData));
    }
    /**
     * Removes entity from database
     * @param object Entity
     */
    public async remove(object: T): Promise<{}> {
        return await this.executeRepositoryFunction(this.getRepository().remove(object));
    }
    /**
     * Removes entities by id or given conditions
     * @param conditions conditions to delete
     */
    public async delete(conditions: any): Promise<DeleteResult> {
        return await this.executeRepositoryFunction(this.getRepository().delete(conditions));
    }
    /**
     * Returns all records for entity
     */
    public async getAll(): Promise<T[]> {
        return await this.executeRepositoryFunction(this.getRepository().find());
    }
    /**
     * Count how many records exists for the given conditions
     * @param conditions conditions to count
     */
    public async count(conditions: any): Promise<number> {
        return await this.executeRepositoryFunction(this.getRepository().count(conditions));
    }
    /**
     * Returns a record that matches an array of conditions
     * @param conditions find options for object
     */
    public async findOne(conditions: any): Promise<T> {
        return await this.executeRepositoryFunction(this.getRepository().findOne(conditions));
    }
    /**
     * Returns a list of records that matches an array of conditions
     * @param conditions find conditions for object
     */
    public async findByFilter(conditions: any): Promise<T[]> {
        return await this.executeRepositoryFunction(this.getRepository().find(conditions));
    }
    /**
     * This truncates everything from the table (WARNING)
     */
    public async clear(): Promise<void> {
        return await this.executeRepositoryFunction(this.getRepository().clear());
    }
}
