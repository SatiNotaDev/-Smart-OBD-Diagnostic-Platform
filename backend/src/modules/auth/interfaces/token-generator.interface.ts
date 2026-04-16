// Interface Segregation Principle - отдельный интерфейс для токенов
export interface ITokenGenerator {
  generateAccessToken(payload: any): string;
  generateRefreshToken(payload: any): string;
  verifyToken(token: string): any;
}
