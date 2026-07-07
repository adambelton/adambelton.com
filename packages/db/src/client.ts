export type DatabaseClient = {
  connectionString: string;
};

export function createDatabaseClient(connectionString: string): DatabaseClient {
  return {
    connectionString
  };
}
