// Interface Segregation Principle - отдельный интерфейс для хеширования
export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
